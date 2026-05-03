const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedSocietyData() {
  // Using multiple batches if needed, though 95 docs fit in one (limit is 500)
  const batch = db.batch();
  
  const wings = [
    { name: 'A', floors: 7, flatsPerFloor: 4, type: '1 rk' },
    { name: 'B', floors: 7, flatsPerFloor: 4, type: '1 bhk', extraGround: true },
    { name: 'C', floors: 7, flatsPerFloor: 3, mixed: true, extraGround: true },
    { name: 'D', floors: 4, flatsPerFloor: 4, type: '1 rk' }
  ];

  console.log("🚀 Starting Seeding...");
  let totalCount = 0;

  for (const wing of wings) {
    // floor 0 to wing.floors (inclusive)
    for (let floor = 0; floor <= wing.floors; floor++) {
      
      let flatsInThisFloor = wing.flatsPerFloor;
      
      // Logic for Ground Floor (0) extra flat 005
      if (floor === 0 && wing.extraGround) {
        flatsInThisFloor = 5; // Force 5 flats for B and C on ground
      }

      for (let f = 1; f <= flatsInThisFloor; f++) {
        let flatNo = (floor * 100) + f;
        let flatId = `${wing.name}-${flatNo.toString().padStart(3, '0')}`;
        let flatType = wing.type;

        // Special Logic for Wing C (2x 1bhk, 1x 2bhk)
        if (wing.mixed) {
          if (floor === 0 && f === 5) {
             flatType = '1 bhk'; // The extra 005 is 1 bhk
          } else {
             // If f=1,2 -> 1bhk | If f=3 -> 2bhk
             flatType = (f === 3) ? '2 bhk' : '1 bhk';
          }
        }

        const flatRef = db.collection('flats').doc(flatId);
        batch.set(flatRef, {
          wing: wing.name,
          flatNo: flatNo,
          floor: floor,
          type: flatType,
          isRegistered: false,
          ownerId: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        totalCount++;
      }
    }
  }

  await batch.commit();
  console.log(`✅ Success! ${totalCount} flats created in Firestore.`);
}

seedSocietyData().catch(err => {
  console.error("❌ Seeding failed:", err);
});