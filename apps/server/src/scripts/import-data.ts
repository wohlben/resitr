import 'dotenv/config';
import { workspaceRoot } from '@nx/devkit';
import * as path from 'path';
import * as fs from 'fs/promises';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../app/core/persistence/schemas';
import { CompendiumExerciseRepository } from '../app/core/persistence/repositories/compendium-exercise.repository';
import { CompendiumEquipmentRepository } from '../app/core/persistence/repositories/compendium-equipment.repository';
import { CompendiumExerciseGroupRepository } from '../app/core/persistence/repositories/compendium-exercise-group.repository';
import { CompendiumExerciseGroupMemberRepository } from '../app/core/persistence/repositories/compendium-exercise-group-member.repository';
import { CompendiumExerciseRelationshipRepository } from '../app/core/persistence/repositories/compendium-exercise-relationship.repository';
import { CompendiumExerciseVideoRepository } from '../app/core/persistence/repositories/compendium-exercise-video.repository';

interface ImportStats {
  exercises: { success: number; failed: number; skipped: number };
  equipment: { success: number; failed: number; skipped: number };
  exerciseGroups: { success: number; failed: number; skipped: number };
  exerciseGroupMembers: { success: number; failed: number; skipped: number };
  equipmentFulfillment: { success: number; failed: number; skipped: number };
  exerciseRelationships: { success: number; failed: number; skipped: number };
  exerciseVideos: { success: number; failed: number; skipped: number };
}

// Timestamp fields that need conversion from Unix timestamp (seconds) to Date
const TIMESTAMP_FIELDS = new Set(['createdAt', 'updatedAt', 'addedAt']);

function convertTimestamps(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  } else if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Convert Unix timestamps (in seconds) to Date objects
      if (TIMESTAMP_FIELDS.has(key) && typeof value === 'number' && value !== null) {
        result[key] = new Date(value * 1000);
      } else {
        result[key] = convertTimestamps(value);
      }
    }
    return result;
  }
  return obj;
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

async function readJsonFiles(directory: string): Promise<any[]> {
  try {
    const files = await fs.readdir(directory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const data = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(directory, file);
        const content = await fs.readFile(filePath, 'utf-8');
        try {
          const parsed = JSON.parse(content);
          const camelCased = toCamelCase(parsed);
          return convertTimestamps(camelCased);
        } catch (error) {
          console.error(`Error parsing ${file}:`, error);
          return null;
        }
      })
    );

    return data.filter(item => item !== null);
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

async function importData() {
  console.log('Starting data import...\n');

  const stats: ImportStats = {
    exercises: { success: 0, failed: 0, skipped: 0 },
    equipment: { success: 0, failed: 0, skipped: 0 },
    exerciseGroups: { success: 0, failed: 0, skipped: 0 },
    exerciseGroupMembers: { success: 0, failed: 0, skipped: 0 },
    equipmentFulfillment: { success: 0, failed: 0, skipped: 0 },
    exerciseRelationships: { success: 0, failed: 0, skipped: 0 },
    exerciseVideos: { success: 0, failed: 0, skipped: 0 },
  };

  // Initialize database connection
  const dbPath = path.join(workspaceRoot, 'data', 'server.db');
  const db = drizzle({
    connection: { url: `file:${dbPath}` },
    schema,
  });

  // Initialize repositories
  const exerciseRepo = new CompendiumExerciseRepository(db as any);
  const equipmentRepo = new CompendiumEquipmentRepository(db as any);
  const exerciseGroupRepo = new CompendiumExerciseGroupRepository(db as any);
  const exerciseGroupMemberRepo = new CompendiumExerciseGroupMemberRepository(db as any);
  const exerciseRelationshipRepo = new CompendiumExerciseRelationshipRepository(db as any);
  const exerciseVideoRepo = new CompendiumExerciseVideoRepository(db as any);

  const rawDataPath = path.join(workspaceRoot, 'data', 'raw-json');

  // Import Equipment (must come first due to foreign key dependencies)
  console.log('Importing equipment...');
  const equipmentDir = path.join(rawDataPath, 'compendium_equipments');
  const equipmentData = await readJsonFiles(equipmentDir);
  for (const equipment of equipmentData) {
    try {
      await equipmentRepo.upsert(equipment);
      stats.equipment.success++;
    } catch (error) {
      console.error(`Failed to import equipment ${equipment.template_id}:`, error);
      stats.equipment.failed++;
    }
  }
  console.log(`Equipment imported: ${stats.equipment.success} success, ${stats.equipment.failed} failed\n`);

  // Import Equipment Fulfillment
  console.log('Importing equipment fulfillment...');
  const fulfillmentDir = path.join(rawDataPath, 'compendium_equipment_fulfillment');
  const fulfillmentData = await readJsonFiles(fulfillmentDir);

  // Group fulfillments by equipment template ID
  const fulfillmentsByEquipment = new Map<string, string[]>();
  for (const fulfillment of fulfillmentData) {
    const equipmentId = fulfillment.equipmentTemplateId;
    const fulfillsId = fulfillment.fulfillsEquipmentTemplateId;
    if (!fulfillmentsByEquipment.has(equipmentId)) {
      fulfillmentsByEquipment.set(equipmentId, []);
    }
    fulfillmentsByEquipment.get(equipmentId)!.push(fulfillsId);
  }

  // Set substitutesFor relationships for each equipment
  for (const [equipmentId, fulfillsIds] of fulfillmentsByEquipment.entries()) {
    try {
      await equipmentRepo.setSubstitutesFor(equipmentId, fulfillsIds, 'import-script');
      stats.equipmentFulfillment.success++;
    } catch (error) {
      console.error(`Failed to import equipment fulfillment for ${equipmentId}:`, error);
      stats.equipmentFulfillment.failed++;
    }
  }
  console.log(`Equipment fulfillment imported: ${stats.equipmentFulfillment.success} success, ${stats.equipmentFulfillment.failed} failed\n`);

  // Import Exercise Groups
  console.log('Importing exercise groups...');
  const exerciseGroupsDir = path.join(rawDataPath, 'compendium_exercise_groups');
  const exerciseGroupsData = await readJsonFiles(exerciseGroupsDir);
  for (const group of exerciseGroupsData) {
    try {
      await exerciseGroupRepo.upsert(group);
      stats.exerciseGroups.success++;
    } catch (error) {
      console.error(`Failed to import exercise group ${group.id}:`, error);
      stats.exerciseGroups.failed++;
    }
  }
  console.log(`Exercise groups imported: ${stats.exerciseGroups.success} success, ${stats.exerciseGroups.failed} failed\n`);

  // Import Exercises
  console.log('Importing exercises...');
  const exercisesDir = path.join(rawDataPath, 'compendium_exercises');
  const exercisesData = await readJsonFiles(exercisesDir);
  for (const exercise of exercisesData) {
    try {
      await exerciseRepo.upsert(exercise);
      stats.exercises.success++;
    } catch (error) {
      console.error(`Failed to import exercise ${exercise.templateId}:`, error);
      stats.exercises.failed++;
    }
  }
  console.log(`Exercises imported: ${stats.exercises.success} success, ${stats.exercises.failed} failed\n`);

  // Import Exercise Group Members
  console.log('Importing exercise group members...');
  const membersDir = path.join(rawDataPath, 'compendium_exercise_group_members');
  const membersData = await readJsonFiles(membersDir);
  for (const member of membersData) {
    try {
      await exerciseGroupMemberRepo.upsert(member);
      stats.exerciseGroupMembers.success++;
    } catch (error) {
      console.error(`Failed to import exercise group member:`, error);
      stats.exerciseGroupMembers.failed++;
    }
  }
  console.log(`Exercise group members imported: ${stats.exerciseGroupMembers.success} success, ${stats.exerciseGroupMembers.failed} failed\n`);

  // Import Exercise Relationships
  console.log('Importing exercise relationships...');
  const relationshipsDir = path.join(rawDataPath, 'compendium_relationships');
  const relationshipsData = await readJsonFiles(relationshipsDir);
  for (const relationship of relationshipsData) {
    try {
      await exerciseRelationshipRepo.upsert(relationship);
      stats.exerciseRelationships.success++;
    } catch (error) {
      console.error(`Failed to import exercise relationship:`, error);
      stats.exerciseRelationships.failed++;
    }
  }
  console.log(`Exercise relationships imported: ${stats.exerciseRelationships.success} success, ${stats.exerciseRelationships.failed} failed\n`);

  // Print final summary
  console.log('='.repeat(50));
  console.log('Import Summary:');
  console.log('='.repeat(50));
  console.log(`Equipment: ${stats.equipment.success} success, ${stats.equipment.failed} failed`);
  console.log(`Equipment Fulfillment: ${stats.equipmentFulfillment.success} success, ${stats.equipmentFulfillment.failed} failed`);
  console.log(`Exercise Groups: ${stats.exerciseGroups.success} success, ${stats.exerciseGroups.failed} failed`);
  console.log(`Exercises: ${stats.exercises.success} success, ${stats.exercises.failed} failed`);
  console.log(`Exercise Group Members: ${stats.exerciseGroupMembers.success} success, ${stats.exerciseGroupMembers.failed} failed`);
  console.log(`Exercise Relationships: ${stats.exerciseRelationships.success} success, ${stats.exerciseRelationships.failed} failed`);
  console.log('='.repeat(50));

  const totalSuccess =
    stats.equipment.success +
    stats.equipmentFulfillment.success +
    stats.exerciseGroups.success +
    stats.exercises.success +
    stats.exerciseGroupMembers.success +
    stats.exerciseRelationships.success;

  const totalFailed =
    stats.equipment.failed +
    stats.equipmentFulfillment.failed +
    stats.exerciseGroups.failed +
    stats.exercises.failed +
    stats.exerciseGroupMembers.failed +
    stats.exerciseRelationships.failed;

  console.log(`\nTotal: ${totalSuccess} success, ${totalFailed} failed`);
  console.log('\nData import completed!');
}

// Run the import
importData()
  .then(() => {
    console.log('Import script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import script failed:', error);
    process.exit(1);
  });
