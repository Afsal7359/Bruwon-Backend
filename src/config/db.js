import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { autoIndex: true });
  console.log(`✔ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
