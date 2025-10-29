import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export const CompendiumQueries = {
  equipments: {
    key: 'compendium-equipments',
    fn: (client: HttpClient) => lastValueFrom(client.get('/api/compendium/equipments'))
  }
} as const
