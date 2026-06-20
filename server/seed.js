import Site from "./models/Site.js";
import Unit from "./models/Unit.js";

const seedSites = [
  {
    name: "Lincoln High School",
    city: "Sacramento, CA",
    country: "USA",
    profile: "wildfire_spike",
    rooms: [
      ["Room 101", 420, 185],
      ["Room 118", 390, 170],
      ["Library Annex", 460, 230],
      ["Science Lab", 440, 210]
    ]
  },
  {
    name: "Sunrise Public School",
    city: "Delhi",
    country: "India",
    profile: "chronic_high",
    rooms: [
      ["Classroom A", 410, 160],
      ["Classroom B", 385, 150],
      ["Computer Lab", 450, 205],
      ["Assembly Room", 500, 260]
    ]
  }
];

export async function seedDemoData() {
  const existingSites = await Site.countDocuments();
  if (existingSites > 0) {
    return { created: false };
  }

  for (const siteConfig of seedSites) {
    const site = await Site.create({
      name: siteConfig.name,
      city: siteConfig.city,
      country: siteConfig.country,
      profile: siteConfig.profile
    });

    await Unit.insertMany(
      siteConfig.rooms.map(([roomName, fanCFM, roomVolumeM3], index) => ({
        siteId: site._id,
        roomName,
        fanCFM,
        numFilters: index === 2 ? 5 : 4,
        roomVolumeM3
      }))
    );
  }

  return { created: true };
}

export default seedDemoData;
