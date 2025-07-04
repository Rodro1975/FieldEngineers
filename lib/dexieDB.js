import Dexie from "dexie";

export const db = new Dexie("FieldEngineersDB");

db.version(1).stores({
  engineers:
    "id, full_name, city, english_level, available, proyect, email, telephone, updated_at",
});
