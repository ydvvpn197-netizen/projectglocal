import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'glocal',
  password: process.env.DB_PASSWORD ?? 'glocal',
  database: process.env.DB_NAME ?? 'glocal',
  entities: [User],
  synchronize: false
});

async function main() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(User);
  const exists = await repo.findOne({ where: { email: 'demo@glocal.local' } });
  if (!exists) {
    const u = repo.create({ email: 'demo@glocal.local', passwordHash: 'x' });
    await repo.save(u);
  }
  await dataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



