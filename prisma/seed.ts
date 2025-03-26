const { PrismaClient, EventCategory } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Clear existing events
  await prisma.event.deleteMany()

  // Seed events from the spreadsheet
  const events = [
    {
      name: "Palenque y Cañon del Sumidero",
      city: "Chiapas",
      country: "Mexico",
      startDate: new Date("2024-01-16"),
      endDate: new Date("2024-01-19"),
      description: "Explora las ruinas mayas de Palenque y navega por el impresionante Cañon del Sumidero",
      highlights: ["Ruinas de Palenque", "Cañon del Sumidero", "Cultura Maya"],
      activities: ["Senderismo", "Navegación", "Fotografía"],
      category: EventCategory.CULTURAL,
      isHighlight: true,
    },
    {
      name: "Tour a Cenotes y Las Coloradas",
      city: "Merida",
      state: "Yucatan",
      country: "Mexico",
      startDate: new Date("2024-01-23"),
      endDate: new Date("2024-01-26"),
      description: "Descubre los místicos cenotes y las famosas aguas rosadas de Las Coloradas",
      highlights: ["Cenotes", "Las Coloradas", "Aguas cristalinas"],
      activities: ["Natación", "Snorkel", "Fotografía"],
      category: EventCategory.NATURE,
      isHighlight: false,
    },
    {
      name: "Hierve el Agua y Mirador de Cristal",
      city: "Oaxaca",
      country: "Mexico",
      startDate: new Date("2024-02-13"),
      endDate: new Date("2024-02-16"),
      description: "Visita las cascadas petrificadas de Hierve el Agua y el impresionante mirador de cristal",
      highlights: ["Hierve el Agua", "Mirador de Cristal", "Vistas panorámicas"],
      activities: ["Senderismo", "Fotografía", "Baño en aguas termales"],
      category: EventCategory.NATURE,
      isHighlight: true,
    },
    {
      name: "Sky Bike y Puente de Dios",
      city: "Huasteca",
      state: "San Luis Potosí",
      country: "Mexico",
      startDate: new Date("2024-02-20"),
      endDate: new Date("2024-02-23"),
      description: "Aventura en Sky Bike y exploración del místico Puente de Dios",
      highlights: ["Sky Bike", "Puente de Dios", "Cascadas"],
      activities: ["Ciclismo aéreo", "Natación", "Senderismo"],
      category: EventCategory.ADVENTURE,
      isHighlight: true,
    },
    {
      name: "Bahías Huatulco y Kayak al Amanecer",
      city: "Huatulco",
      state: "Oaxaca",
      country: "Mexico",
      startDate: new Date("2024-02-27"),
      endDate: new Date("2024-03-02"),
      description: "Explora las hermosas bahías de Huatulco y disfruta de un paseo en kayak al amanecer",
      highlights: ["Bahías", "Kayak al amanecer", "Playas vírgenes"],
      activities: ["Kayak", "Snorkel", "Playa"],
      category: EventCategory.BEACH,
      isHighlight: true,
    }
  ]

  for (const event of events) {
    await prisma.event.create({
      data: event
    })
  }

  console.log('Database has been seeded with events from the spreadsheet')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 