export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'glocal',
    password: process.env.DB_PASSWORD ?? 'glocal',
    name: process.env.DB_NAME ?? 'glocal'
  }
});



