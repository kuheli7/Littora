import "dotenv/config";
import { supabase } from "../services/supabaseClient.js";

const UPDATES = [
  // Marina Beach, Chennai
  { id: "a1b2c3d4-0001-0000-0000-000000000001", latitude: 13.0499, longitude: 80.2824, location_label: "Marina Beach, Chennai" },
  { id: "ad01b9c1-8677-493a-9c4f-97fcec1c033f", latitude: 13.0499, longitude: 80.2824, location_label: "Marina Beach, Chennai" },
  { id: "acfe2563-1c96-483e-85f0-c4e55ddb268f", latitude: 13.0499, longitude: 80.2824, location_label: "Marina Beach, Chennai" },

  // Puri Beach, Odisha
  { id: "a1b2c3d4-0002-0000-0000-000000000002", latitude: 19.7983, longitude: 85.8249, location_label: "Puri Beach, Odisha" },
  { id: "84d4f56d-9116-4052-b811-a568e971d608", latitude: 19.7983, longitude: 85.8249, location_label: "Puri Beach, Odisha" },
  { id: "de9892b3-8d00-42cf-af8a-ec805c45e3d2", latitude: 19.7983, longitude: 85.8249, location_label: "Puri Beach, Odisha" },

  // Malpe Beach, Udupi
  { id: "a1b2c3d4-0003-0000-0000-000000000003", latitude: 13.3489, longitude: 74.7037, location_label: "Malpe Beach, Udupi" },
  { id: "5743a224-26c6-43bd-a2aa-e9c918525d7a", latitude: 13.3489, longitude: 74.7037, location_label: "Malpe Beach, Udupi" },
];

async function runMigration() {
  console.log("Starting Supabase database coordinate update...");
  for (const item of UPDATES) {
    const { data, error } = await supabase
      .from("analyses")
      .update({
        latitude: item.latitude,
        longitude: item.longitude,
        location_label: item.location_label,
      })
      .eq("id", item.id)
      .select();

    if (error) {
      console.error(`Error updating row ${item.id}:`, error.message);
    } else {
      console.log(`Updated ${item.id} -> ${item.location_label} (${item.latitude}, ${item.longitude})`);
    }
  }
  console.log("Database update completed.");
}

runMigration();
