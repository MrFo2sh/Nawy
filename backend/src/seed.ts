import { connectDatabase, disconnectDatabase } from "./config/database";
import { Apartment } from "./models";
import User from "./models/User";

const sampleUsers = [
  {
    name: "Test User",
    email: "test@test.com",
    password: "Password123!",
    phone: "+14155550000",
  },
  {
    name: "John Smith",
    email: "john.smith@example.com",
    password: "Password123!",
    phone: "+14155551234",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    password: "Password123!",
    phone: "+12125551234",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    password: "Password123!",
    phone: "+13125551234",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@example.com",
    password: "Password123!",
    phone: "+15125551234",
  },
];

const testUserApartments = [
  {
    unitName: "Test Property 1 - Luxury Studio",
    unitNumber: "T101",
    project: "Test Heights",
    description:
      "Premium test studio apartment with stunning city views. Features include hardwood floors, stainless steel appliances, and floor-to-ceiling windows. Perfect for testing apartment features.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 550,
    price: 2200,
    address: "123 Test Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: ["Gym", "Pool", "Concierge", "Rooftop Deck", "Package Service"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    isAvailable: true,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "test@example.com",
    contactPhone: "+14155550000",
    virtualTourUrl: "https://example.com/tour/t101",
  },
  {
    unitName: "Test Property 2 - Spacious One Bedroom",
    unitNumber: "T205",
    project: "Test Heights",
    description:
      "Bright one-bedroom test apartment with modern finishes and an open-concept living area. Includes in-unit laundry and a private balcony.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 750,
    price: 2800,
    address: "123 Test Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: [
      "Gym",
      "Pool",
      "Concierge",
      "Rooftop Deck",
      "Package Service",
      "In-unit Laundry",
    ],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months", "24 months"],
    contactEmail: "test@example.com",
    contactPhone: "+14155550000",
  },
  {
    unitName: "Test Property 3 - Family Two Bedroom",
    unitNumber: "T310",
    project: "Test Heights",
    description:
      "Perfect for testing family features! This two-bedroom unit features a large living room, updated kitchen with granite countertops, and two full bathrooms.",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1100,
    price: 3500,
    address: "123 Test Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: [
      "Gym",
      "Pool",
      "Concierge",
      "Rooftop Deck",
      "Package Service",
      "Children's Playground",
    ],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
    isAvailable: false,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "test@example.com",
    contactPhone: "+14155550000",
  },
  {
    unitName: "Test Property 4 - Premium Three Bedroom",
    unitNumber: "T501",
    project: "Test Heights",
    description:
      "Spacious three-bedroom test property with premium finishes. Features include a master suite, gourmet kitchen, and multiple balconies with city views.",
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 1400,
    price: 4200,
    address: "123 Test Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: [
      "Gym",
      "Pool",
      "Concierge",
      "Rooftop Deck",
      "Package Service",
      "Master Suite",
      "Multiple Balconies",
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "24 months", "36 months"],
    contactEmail: "test@example.com",
    contactPhone: "+14155550000",
    virtualTourUrl: "https://example.com/tour/t501",
  },
];

const sampleApartments = [
  {
    unitName: "Luxury Studio",
    unitNumber: "A101",
    project: "Sunset Heights",
    description:
      "Modern studio apartment with stunning city views. Features include hardwood floors, stainless steel appliances, and floor-to-ceiling windows.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 550,
    price: 2200,
    address: "123 Main Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: ["Gym", "Pool", "Concierge", "Rooftop Deck", "Package Service"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    isAvailable: true,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "leasing@sunsetheights.com",
    contactPhone: "+14155551234",
    virtualTourUrl: "https://example.com/tour/a101",
  },
  {
    unitName: "Spacious One Bedroom",
    unitNumber: "B205",
    project: "Sunset Heights",
    description:
      "Bright one-bedroom apartment with modern finishes and an open-concept living area. Includes in-unit laundry and a private balcony.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 750,
    price: 2800,
    address: "123 Main Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: [
      "Gym",
      "Pool",
      "Concierge",
      "Rooftop Deck",
      "Package Service",
      "In-unit Laundry",
    ],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months", "24 months"],
    contactEmail: "leasing@sunsetheights.com",
    contactPhone: "+14155551234",
  },
  {
    unitName: "Family Two Bedroom",
    unitNumber: "C310",
    project: "Sunset Heights",
    description:
      "Perfect for families! This two-bedroom unit features a large living room, updated kitchen with granite countertops, and two full bathrooms.",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1100,
    price: 3500,
    address: "123 Main Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    amenities: [
      "Gym",
      "Pool",
      "Concierge",
      "Rooftop Deck",
      "Package Service",
      "Children's Playground",
    ],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
    isAvailable: false,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "leasing@sunsetheights.com",
    contactPhone: "+14155551234",
  },
  {
    unitName: "Cozy Studio",
    unitNumber: "1A",
    project: "Downtown Lofts",
    description:
      "Charming studio in the heart of downtown. Exposed brick walls, high ceilings, and large windows create a unique urban living experience.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 450,
    price: 1800,
    address: "456 Broadway",
    city: "New York",
    state: "New York",
    zipCode: "10013",
    amenities: ["Fitness Center", "Bike Storage", "Rooftop Garden"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
    isAvailable: true,
    petPolicy: "not-allowed",
    parkingSpaces: 0,
    leaseTerms: ["12 months"],
    contactEmail: "info@downtownlofts.com",
    contactPhone: "+12125551234",
  },
  {
    unitName: "Modern One Bedroom",
    unitNumber: "2B",
    project: "Downtown Lofts",
    description:
      "Contemporary one-bedroom with sleek finishes, stainless steel appliances, and a spa-like bathroom. Prime downtown location.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 650,
    price: 2400,
    address: "456 Broadway",
    city: "New York",
    state: "New York",
    zipCode: "10013",
    amenities: [
      "Fitness Center",
      "Bike Storage",
      "Rooftop Garden",
      "Concierge",
    ],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
    ],
    isAvailable: true,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months"],
    contactEmail: "info@downtownlofts.com",
    contactPhone: "+12125551234",
  },
  {
    unitName: "Luxury Penthouse",
    unitNumber: "PH1",
    project: "Riverside Towers",
    description:
      "Spectacular penthouse with panoramic river views. Features include a private terrace, high-end finishes throughout, and premium appliances.",
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 1800,
    price: 5500,
    address: "789 River Drive",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60601",
    amenities: [
      "Doorman",
      "Valet Parking",
      "Private Terrace",
      "Wine Storage",
      "Spa",
      "Business Center",
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "24 months", "36 months"],
    contactEmail: "luxury@riversidetowers.com",
    contactPhone: "+13125551234",
    virtualTourUrl: "https://example.com/tour/ph1",
  },
  {
    unitName: "Garden Level One Bedroom",
    unitNumber: "G01",
    project: "Riverside Towers",
    description:
      "Ground floor apartment with direct access to the beautiful garden courtyard. Perfect for those who love outdoor space.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 700,
    price: 2600,
    address: "789 River Drive",
    city: "Chicago",
    state: "Illinois",
    zipCode: "60601",
    amenities: [
      "Doorman",
      "Garden Access",
      "Fitness Center",
      "Package Service",
    ],
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "leasing@riversidetowers.com",
    contactPhone: "+13125551234",
  },
  {
    unitName: "Executive Two Bedroom",
    unitNumber: "1501",
    project: "Tech Plaza",
    description:
      "Modern two-bedroom apartment in the heart of the tech district. Features smart home technology and premium finishes.",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1050,
    price: 4200,
    address: "321 Innovation Way",
    city: "Austin",
    state: "Texas",
    zipCode: "78701",
    amenities: [
      "Co-working Space",
      "High-Speed Internet",
      "Gym",
      "Pool",
      "EV Charging",
    ],
    images: [
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800",
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800",
    ],
    isAvailable: false,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months"],
    contactEmail: "hello@techplaza.com",
    contactPhone: "+15125551234",
  },
  {
    unitName: "Compact Studio",
    unitNumber: "301",
    project: "Urban Living",
    description:
      "Efficient studio apartment perfect for young professionals. Modern design with clever storage solutions and great natural light.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 400,
    price: 1650,
    address: "555 Market Street",
    city: "Seattle",
    state: "Washington",
    zipCode: "98101",
    amenities: ["Gym", "Rooftop Lounge", "Package Service", "Bike Storage"],
    images: [
      "https://images.unsplash.com/photo-1559599238-1c85a2ee4d4d?w=800",
      "https://images.unsplash.com/photo-1581739411332-aab50ba0c9b9?w=800",
    ],
    isAvailable: true,
    petPolicy: "not-allowed",
    parkingSpaces: 0,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "info@urbanliving.com",
    contactPhone: "+12065551234",
  },
  {
    unitName: "Deluxe One Bedroom",
    unitNumber: "402",
    project: "Urban Living",
    description:
      "Spacious one-bedroom with city views and upgraded appliances. Features include quartz countertops and hardwood floors.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 800,
    price: 2300,
    address: "555 Market Street",
    city: "Seattle",
    state: "Washington",
    zipCode: "98101",
    amenities: [
      "Gym",
      "Rooftop Lounge",
      "Package Service",
      "Bike Storage",
      "In-unit Laundry",
    ],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    isAvailable: true,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months", "24 months"],
    contactEmail: "info@urbanliving.com",
    contactPhone: "+12065551234",
  },
  {
    unitName: "Loft Style Studio",
    unitNumber: "L100",
    project: "Arts District Lofts",
    description:
      "Creative loft-style studio with exposed brick and high ceilings. Located in the vibrant arts district with galleries and cafes nearby.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 600,
    price: 1950,
    address: "777 Arts Avenue",
    city: "Los Angeles",
    state: "California",
    zipCode: "90014",
    amenities: [
      "Artist Studios",
      "Gallery Space",
      "Rooftop Garden",
      "Bike Storage",
    ],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months"],
    contactEmail: "creative@artslofts.com",
    contactPhone: "+13235551234",
  },
  {
    unitName: "Classic One Bedroom",
    unitNumber: "2C",
    project: "Heritage Square",
    description:
      "Charming one-bedroom in a historic building with original hardwood floors and crown molding. Perfect blend of classic and modern.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 720,
    price: 2100,
    address: "888 Heritage Lane",
    city: "Boston",
    state: "Massachusetts",
    zipCode: "02116",
    amenities: ["Historic Charm", "Courtyard", "Package Service", "Storage"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
    isAvailable: false,
    petPolicy: "conditional",
    parkingSpaces: 0,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "leasing@heritagesquare.com",
    contactPhone: "+16175551234",
  },
  {
    unitName: "Luxury Two Bedroom",
    unitNumber: "1202",
    project: "Skyline Towers",
    description:
      "Premium two-bedroom with floor-to-ceiling windows and stunning skyline views. High-end finishes throughout with marble bathrooms.",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    price: 4800,
    address: "999 Skyline Drive",
    city: "Miami",
    state: "Florida",
    zipCode: "33131",
    amenities: [
      "Pool",
      "Spa",
      "Valet",
      "Concierge",
      "Beach Access",
      "Wine Cellar",
    ],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "24 months", "36 months"],
    contactEmail: "luxury@skylinetowers.com",
    contactPhone: "+13055551234",
    virtualTourUrl: "https://example.com/tour/skyline1202",
  },
  {
    unitName: "Cozy Efficiency",
    unitNumber: "S05",
    project: "Student Haven",
    description:
      "Perfect for students! Compact but well-designed efficiency apartment near campus. Includes study area and mini kitchen.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 350,
    price: 1200,
    address: "444 University Boulevard",
    city: "Madison",
    state: "Wisconsin",
    zipCode: "53706",
    amenities: ["Study Rooms", "Laundry", "Recreation Room", "Bike Storage"],
    images: ["https://images.unsplash.com/photo-1559599238-1c85a2ee4d4d?w=800"],
    isAvailable: true,
    petPolicy: "not-allowed",
    parkingSpaces: 0,
    leaseTerms: ["9 months", "12 months"],
    contactEmail: "housing@studenthaven.com",
    contactPhone: "+16085551234",
  },
  {
    unitName: "Mountain View Studio",
    unitNumber: "3A",
    project: "Alpine Residences",
    description:
      "Breathtaking mountain views from this modern studio. Perfect for outdoor enthusiasts with ski storage and mountain bike racks.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 500,
    price: 1800,
    address: "101 Mountain Peak Road",
    city: "Denver",
    state: "Colorado",
    zipCode: "80202",
    amenities: ["Ski Storage", "Bike Racks", "Hot Tub", "Fitness Center"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "info@alpineresidences.com",
    contactPhone: "+13035551234",
  },
  {
    unitName: "Urban Two Bedroom",
    unitNumber: "8B",
    project: "Metro Central",
    description:
      "Contemporary two-bedroom apartment with subway access. Open floor plan with modern kitchen and spacious bedrooms.",
    bedrooms: 2,
    bathrooms: 1.5,
    squareFootage: 950,
    price: 3200,
    address: "222 Metro Plaza",
    city: "Washington",
    state: "District of Columbia",
    zipCode: "20001",
    amenities: ["Metro Access", "Gym", "Rooftop Deck", "Package Service"],
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
    isAvailable: false,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months"],
    contactEmail: "leasing@metrocentral.com",
    contactPhone: "+12025551234",
  },
  {
    unitName: "Waterfront One Bedroom",
    unitNumber: "W101",
    project: "Harbor View",
    description:
      "Stunning waterfront views from this one-bedroom apartment. Features include a private balcony and premium finishes throughout.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 680,
    price: 2700,
    address: "333 Harbor Street",
    city: "Portland",
    state: "Oregon",
    zipCode: "97201",
    amenities: ["Waterfront", "Private Balcony", "Gym", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "harbor@harborview.com",
    contactPhone: "+15035551234",
  },
  {
    unitName: "Penthouse Suite",
    unitNumber: "PH2",
    project: "Elite Towers",
    description:
      "Exclusive penthouse with panoramic city views, private elevator access, and luxury amenities. The ultimate in urban living.",
    bedrooms: 3,
    bathrooms: 3,
    squareFootage: 2000,
    price: 6800,
    address: "555 Elite Avenue",
    city: "Las Vegas",
    state: "Nevada",
    zipCode: "89101",
    amenities: [
      "Private Elevator",
      "Butler Service",
      "Wine Cellar",
      "Private Terrace",
      "Spa",
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 3,
    leaseTerms: ["12 months", "24 months", "36 months"],
    contactEmail: "elite@elitetowers.com",
    contactPhone: "+17025551234",
    virtualTourUrl: "https://example.com/tour/elite-ph2",
  },
  {
    unitName: "Garden Studio",
    unitNumber: "G10",
    project: "Green Valley",
    description:
      "Peaceful studio apartment with garden access and natural lighting. Perfect for those seeking tranquility in the city.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 480,
    price: 1750,
    address: "777 Green Valley Road",
    city: "Phoenix",
    state: "Arizona",
    zipCode: "85001",
    amenities: ["Garden Access", "Pool", "Fitness Center", "Pet Park"],
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1559599238-1c85a2ee4d4d?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "nature@greenvalley.com",
    contactPhone: "+16025551234",
  },
  {
    unitName: "Tech-Smart One Bedroom",
    unitNumber: "S201",
    project: "Smart Living",
    description:
      "Future-forward one-bedroom with integrated smart home technology. Voice-controlled lighting, climate, and security systems.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 750,
    price: 2900,
    address: "888 Innovation Drive",
    city: "San Jose",
    state: "California",
    zipCode: "95110",
    amenities: ["Smart Home Tech", "EV Charging", "Co-working Space", "Gym"],
    images: [
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800",
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800",
    ],
    isAvailable: true,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "18 months", "24 months"],
    contactEmail: "smart@smartliving.com",
    contactPhone: "+14085551234",
  },
  {
    unitName: "Historic One Bedroom",
    unitNumber: "H205",
    project: "Old Town Residences",
    description:
      "Beautifully restored one-bedroom in a historic building. Original architectural details with modern conveniences.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 650,
    price: 2000,
    address: "123 Historic Street",
    city: "Savannah",
    state: "Georgia",
    zipCode: "31401",
    amenities: ["Historic Character", "Courtyard", "Package Service"],
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
    isAvailable: false,
    petPolicy: "not-allowed",
    parkingSpaces: 0,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "historic@oldtownresidences.com",
    contactPhone: "+19125551234",
  },
  {
    unitName: "Luxury Studio Plus",
    unitNumber: "L305",
    project: "Platinum Heights",
    description:
      "Oversized studio with separate sleeping alcove and luxury finishes. Premium location with concierge services.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 650,
    price: 2400,
    address: "999 Platinum Boulevard",
    city: "Atlanta",
    state: "Georgia",
    zipCode: "30309",
    amenities: ["Concierge", "Valet Parking", "Pool", "Spa", "Business Center"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    isAvailable: true,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "platinum@platinumheights.com",
    contactPhone: "+14045551234",
  },
  {
    unitName: "River View Two Bedroom",
    unitNumber: "R402",
    project: "Riverside Commons",
    description:
      "Spectacular river views from this spacious two-bedroom. Features include a large balcony and upgraded kitchen appliances.",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1150,
    price: 3400,
    address: "456 Riverside Drive",
    city: "Nashville",
    state: "Tennessee",
    zipCode: "37201",
    amenities: [
      "River Views",
      "Pool",
      "Fitness Center",
      "Dog Park",
      "Boat Dock",
    ],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "18 months", "24 months"],
    contactEmail: "riverside@riversidecommons.com",
    contactPhone: "+16155551234",
  },
  {
    unitName: "Compact Living Studio",
    unitNumber: "C110",
    project: "Micro Living",
    description:
      "Efficiently designed micro-studio with clever space-saving solutions. Perfect for minimalist lifestyle in prime location.",
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 320,
    price: 1400,
    address: "111 Micro Street",
    city: "Portland",
    state: "Oregon",
    zipCode: "97205",
    amenities: ["Shared Kitchen", "Rooftop Deck", "Bike Storage", "Laundry"],
    images: [
      "https://images.unsplash.com/photo-1581739411332-aab50ba0c9b9?w=800",
    ],
    isAvailable: true,
    petPolicy: "not-allowed",
    parkingSpaces: 0,
    leaseTerms: ["6 months", "12 months"],
    contactEmail: "micro@microliving.com",
    contactPhone: "+15035556789",
  },
  {
    unitName: "Executive Suite",
    unitNumber: "E1501",
    project: "Business District",
    description:
      "Professional one-bedroom suite designed for business travelers and executives. Includes workspace and premium amenities.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 800,
    price: 3100,
    address: "777 Business Plaza",
    city: "Dallas",
    state: "Texas",
    zipCode: "75201",
    amenities: [
      "Business Center",
      "Meeting Rooms",
      "Concierge",
      "Valet",
      "Gym",
    ],
    images: [
      "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800",
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800",
    ],
    isAvailable: false,
    petPolicy: "conditional",
    parkingSpaces: 1,
    leaseTerms: ["3 months", "6 months", "12 months"],
    contactEmail: "executive@businessdistrict.com",
    contactPhone: "+12145551234",
  },
  {
    unitName: "Family Three Bedroom",
    unitNumber: "F801",
    project: "Family Gardens",
    description:
      "Spacious three-bedroom perfect for families. Large living areas, modern kitchen, and access to children's playground.",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1400,
    price: 3800,
    address: "555 Family Lane",
    city: "Minneapolis",
    state: "Minnesota",
    zipCode: "55401",
    amenities: ["Playground", "Pool", "Gym", "Community Garden", "Pet Park"],
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 2,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "family@familygardens.com",
    contactPhone: "+16125551234",
  },
  {
    unitName: "Artist Loft",
    unitNumber: "A701",
    project: "Creative Spaces",
    description:
      "Open concept artist loft with north-facing windows and high ceilings. Perfect for creative professionals with live/work setup.",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 900,
    price: 2200,
    address: "333 Creative Boulevard",
    city: "Santa Fe",
    state: "New Mexico",
    zipCode: "87501",
    amenities: ["Artist Studios", "Gallery Space", "Natural Light", "Storage"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    ],
    isAvailable: true,
    petPolicy: "allowed",
    parkingSpaces: 1,
    leaseTerms: ["12 months", "24 months"],
    contactEmail: "creative@creativespaces.com",
    contactPhone: "+15055551234",
  },
];

async function seedDatabase(): Promise<void> {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to database
    await connectDatabase();

    // Clear existing data
    await Apartment.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing users and apartments");

    // Create sample users first (one by one to trigger password hashing middleware)
    const users: any[] = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log(`✅ Created ${users.length} sample users`);

    // Create apartments with user assignments
    // First, create test user's apartments (to ensure they appear first in listings)
    const testUserApartmentsWithUser = testUserApartments.map((apartment) => ({
      ...apartment,
      userId: users[0]._id, // Test user is first in the array
    }));

    // Create test user's apartments first
    const testApartments = await Apartment.insertMany(
      testUserApartmentsWithUser
    );
    console.log(`✅ Created ${testApartments.length} test user apartments`);

    // Then create the rest of the apartments for other users
    const otherApartmentsWithUsers = sampleApartments.map(
      (apartment, index) => {
        // Distribute among other users (skip test user at index 0)
        const userId = users[1 + (index % (users.length - 1))]._id;
        return {
          ...apartment,
          userId,
        };
      }
    );

    // Insert remaining apartments
    const otherApartments = await Apartment.insertMany(
      otherApartmentsWithUsers
    );
    console.log(`✅ Created ${otherApartments.length} other sample apartments`);

    // Combine all apartments for display
    const allApartments = [...testApartments, ...otherApartments];

    // Display created apartments
    console.log("\n📋 Created apartments:");
    allApartments.forEach((apt, index) => {
      console.log(
        `   ${index + 1}. ${apt.unitName} (${apt.unitNumber}) - ${
          apt.project
        } - $${apt.price}`
      );
    });

    console.log("\n👥 Created users:");
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding process failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;
