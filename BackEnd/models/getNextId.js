import Counter from './counter.js';

export default async function getNextId(sequenceName) {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}
