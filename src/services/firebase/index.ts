import { seedDatabase } from "@/local_database/seedDb";
import admin from "firebase-admin";
import { Env } from "@/libs/Env";

if (Env.NODE_ENV === "test") {
  // We won't be using firebase for testing for now. At some point,
  // we might want to run tests against the Staging firebase instance.
  throw new Error(
    ` This will connect to the production firestore.
      Make sure db/firebase.ts is updated before testing against Firebase`,
  );
}
if (!admin.apps.length && Env.NODE_ENV == "development") {
  if (Env.FIRESTORE_EMULATOR_HOST) {
    console.log("using Firebase **emulator** DB");

    admin.initializeApp({
      projectId: "touch-swap",
      storageBucket: "touch-swap.appspot.com",
    });

    seedDatabase();
  } else {
    admin.initializeApp({
      storageBucket: "touch-swap.appspot.com",
    });
  }
}
else {
   if (!admin.apps.length && Env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log("using Firebase live DB");
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: "touch-swap.appspot.com",
    });
  }
}

export { admin };
