/**
 * US state-level shipping data — 50 states + DC.
 * Major shipping hubs, average ground cost, carrier presence, ports of entry, volume rank.
 */

export interface StateData {
  slug: string;
  name: string;
  code: string;
  shippingHubs: string[];
  avgGroundCostLbs: number; // avg ground shipping cost per lb within/from state
  carriers: { usps: boolean; ups: boolean; fedex: boolean };
  portsOfEntry: string[];
  shippingVolumeRank: number; // 1 = highest volume
}

export const states: StateData[] = [
  { slug: "alabama", name: "Alabama", code: "AL", shippingHubs: ["Birmingham", "Huntsville", "Mobile"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Mobile"], shippingVolumeRank: 28 },
  { slug: "alaska", name: "Alaska", code: "AK", shippingHubs: ["Anchorage", "Fairbanks"], avgGroundCostLbs: 9.50, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Anchorage", "Ted Stevens Anchorage International Airport"], shippingVolumeRank: 49 },
  { slug: "arizona", name: "Arizona", code: "AZ", shippingHubs: ["Phoenix", "Tucson", "Mesa"], avgGroundCostLbs: 5.10, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Nogales Port of Entry", "San Luis Port of Entry"], shippingVolumeRank: 16 },
  { slug: "arkansas", name: "Arkansas", code: "AR", shippingHubs: ["Little Rock", "Fort Smith", "Bentonville"], avgGroundCostLbs: 4.75, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 33 },
  { slug: "california", name: "California", code: "CA", shippingHubs: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "Ontario"], avgGroundCostLbs: 5.25, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Los Angeles", "Port of Long Beach", "Port of Oakland", "San Francisco International Airport", "Los Angeles International Airport"], shippingVolumeRank: 1 },
  { slug: "colorado", name: "Colorado", code: "CO", shippingHubs: ["Denver", "Colorado Springs", "Aurora"], avgGroundCostLbs: 5.05, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Denver International Airport"], shippingVolumeRank: 18 },
  { slug: "connecticut", name: "Connecticut", code: "CT", shippingHubs: ["Hartford", "New Haven", "Bridgeport"], avgGroundCostLbs: 5.15, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Bridgeport", "Port of New Haven"], shippingVolumeRank: 29 },
  { slug: "delaware", name: "Delaware", code: "DE", shippingHubs: ["Wilmington", "Dover"], avgGroundCostLbs: 4.90, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Wilmington"], shippingVolumeRank: 45 },
  { slug: "district-of-columbia", name: "District of Columbia", code: "DC", shippingHubs: ["Washington DC"], avgGroundCostLbs: 5.40, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 51 },
  { slug: "florida", name: "Florida", code: "FL", shippingHubs: ["Miami", "Jacksonville", "Tampa", "Orlando", "Fort Lauderdale"], avgGroundCostLbs: 5.00, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Miami", "Port Everglades", "Port of Jacksonville", "Port of Tampa Bay", "Miami International Airport"], shippingVolumeRank: 3 },
  { slug: "georgia", name: "Georgia", code: "GA", shippingHubs: ["Atlanta", "Savannah", "Augusta"], avgGroundCostLbs: 4.80, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Savannah", "Hartsfield-Jackson Atlanta International Airport"], shippingVolumeRank: 8 },
  { slug: "hawaii", name: "Hawaii", code: "HI", shippingHubs: ["Honolulu"], avgGroundCostLbs: 10.25, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Honolulu", "Daniel K. Inouye International Airport"], shippingVolumeRank: 47 },
  { slug: "idaho", name: "Idaho", code: "ID", shippingHubs: ["Boise", "Idaho Falls"], avgGroundCostLbs: 5.20, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Eastport Port of Entry"], shippingVolumeRank: 42 },
  { slug: "illinois", name: "Illinois", code: "IL", shippingHubs: ["Chicago", "Rockford", "Springfield"], avgGroundCostLbs: 4.70, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Chicago", "Chicago O'Hare International Airport"], shippingVolumeRank: 5 },
  { slug: "indiana", name: "Indiana", code: "IN", shippingHubs: ["Indianapolis", "Fort Wayne", "Evansville"], avgGroundCostLbs: 4.65, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Indiana-Burns Harbor"], shippingVolumeRank: 14 },
  { slug: "iowa", name: "Iowa", code: "IA", shippingHubs: ["Des Moines", "Cedar Rapids", "Davenport"], avgGroundCostLbs: 4.80, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 30 },
  { slug: "kansas", name: "Kansas", code: "KS", shippingHubs: ["Kansas City", "Wichita", "Topeka"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 31 },
  { slug: "kentucky", name: "Kentucky", code: "KY", shippingHubs: ["Louisville", "Lexington", "Covington"], avgGroundCostLbs: 4.60, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Louisville Muhammad Ali International Airport (UPS Worldport)"], shippingVolumeRank: 9 },
  { slug: "louisiana", name: "Louisiana", code: "LA", shippingHubs: ["New Orleans", "Baton Rouge", "Shreveport"], avgGroundCostLbs: 4.90, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of New Orleans", "Port of South Louisiana", "Port of Baton Rouge"], shippingVolumeRank: 19 },
  { slug: "maine", name: "Maine", code: "ME", shippingHubs: ["Portland", "Bangor"], avgGroundCostLbs: 5.45, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Portland", "Calais Port of Entry", "Houlton Port of Entry"], shippingVolumeRank: 43 },
  { slug: "maryland", name: "Maryland", code: "MD", shippingHubs: ["Baltimore", "Silver Spring", "Columbia"], avgGroundCostLbs: 4.95, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Baltimore", "Baltimore/Washington International Airport"], shippingVolumeRank: 15 },
  { slug: "massachusetts", name: "Massachusetts", code: "MA", shippingHubs: ["Boston", "Worcester", "Springfield"], avgGroundCostLbs: 5.20, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Boston", "Boston Logan International Airport"], shippingVolumeRank: 12 },
  { slug: "michigan", name: "Michigan", code: "MI", shippingHubs: ["Detroit", "Grand Rapids", "Flint"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Detroit", "Port Huron", "Sault Ste. Marie"], shippingVolumeRank: 11 },
  { slug: "minnesota", name: "Minnesota", code: "MN", shippingHubs: ["Minneapolis", "Saint Paul", "Duluth"], avgGroundCostLbs: 4.90, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Duluth-Superior", "Minneapolis-Saint Paul International Airport"], shippingVolumeRank: 17 },
  { slug: "mississippi", name: "Mississippi", code: "MS", shippingHubs: ["Jackson", "Gulfport", "Hattiesburg"], avgGroundCostLbs: 4.95, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Gulfport", "Port of Pascagoula"], shippingVolumeRank: 37 },
  { slug: "missouri", name: "Missouri", code: "MO", shippingHubs: ["Kansas City", "St. Louis", "Springfield"], avgGroundCostLbs: 4.70, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of St. Louis"], shippingVolumeRank: 13 },
  { slug: "montana", name: "Montana", code: "MT", shippingHubs: ["Billings", "Missoula", "Great Falls"], avgGroundCostLbs: 5.55, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Sweetgrass Port of Entry", "Raymond Port of Entry"], shippingVolumeRank: 46 },
  { slug: "nebraska", name: "Nebraska", code: "NE", shippingHubs: ["Omaha", "Lincoln"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 34 },
  { slug: "nevada", name: "Nevada", code: "NV", shippingHubs: ["Las Vegas", "Reno", "Henderson"], avgGroundCostLbs: 5.15, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 27 },
  { slug: "new-hampshire", name: "New Hampshire", code: "NH", shippingHubs: ["Manchester", "Nashua"], avgGroundCostLbs: 5.30, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Portsmouth"], shippingVolumeRank: 44 },
  { slug: "new-jersey", name: "New Jersey", code: "NJ", shippingHubs: ["Newark", "Jersey City", "Elizabeth", "Edison"], avgGroundCostLbs: 4.95, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port Newark-Elizabeth Marine Terminal", "Newark Liberty International Airport"], shippingVolumeRank: 4 },
  { slug: "new-mexico", name: "New Mexico", code: "NM", shippingHubs: ["Albuquerque", "Las Cruces", "Santa Fe"], avgGroundCostLbs: 5.25, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Columbus Port of Entry", "Santa Teresa Port of Entry"], shippingVolumeRank: 39 },
  { slug: "new-york", name: "New York", code: "NY", shippingHubs: ["New York City", "Buffalo", "Albany", "Rochester"], avgGroundCostLbs: 5.30, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of New York and New Jersey", "John F. Kennedy International Airport", "Port of Buffalo-Niagara"], shippingVolumeRank: 2 },
  { slug: "north-carolina", name: "North Carolina", code: "NC", shippingHubs: ["Charlotte", "Raleigh", "Greensboro"], avgGroundCostLbs: 4.80, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Wilmington", "Port of Morehead City"], shippingVolumeRank: 10 },
  { slug: "north-dakota", name: "North Dakota", code: "ND", shippingHubs: ["Fargo", "Bismarck"], avgGroundCostLbs: 5.45, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Pembina Port of Entry", "Portal Port of Entry"], shippingVolumeRank: 48 },
  { slug: "ohio", name: "Ohio", code: "OH", shippingHubs: ["Columbus", "Cleveland", "Cincinnati", "Toledo"], avgGroundCostLbs: 4.65, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Cleveland", "Port of Toledo", "Port of Cincinnati"], shippingVolumeRank: 7 },
  { slug: "oklahoma", name: "Oklahoma", code: "OK", shippingHubs: ["Oklahoma City", "Tulsa"], avgGroundCostLbs: 4.90, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Catoosa"], shippingVolumeRank: 32 },
  { slug: "oregon", name: "Oregon", code: "OR", shippingHubs: ["Portland", "Eugene", "Salem"], avgGroundCostLbs: 5.10, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Portland", "Port of Coos Bay"], shippingVolumeRank: 24 },
  { slug: "pennsylvania", name: "Pennsylvania", code: "PA", shippingHubs: ["Philadelphia", "Pittsburgh", "Harrisburg", "Allentown"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Philadelphia", "Philadelphia International Airport", "Port of Pittsburgh"], shippingVolumeRank: 6 },
  { slug: "rhode-island", name: "Rhode Island", code: "RI", shippingHubs: ["Providence", "Warwick"], avgGroundCostLbs: 5.25, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Providence"], shippingVolumeRank: 50 },
  { slug: "south-carolina", name: "South Carolina", code: "SC", shippingHubs: ["Charleston", "Columbia", "Greenville"], avgGroundCostLbs: 4.80, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Charleston"], shippingVolumeRank: 22 },
  { slug: "south-dakota", name: "South Dakota", code: "SD", shippingHubs: ["Sioux Falls", "Rapid City"], avgGroundCostLbs: 5.35, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 47 },
  { slug: "tennessee", name: "Tennessee", code: "TN", shippingHubs: ["Memphis", "Nashville", "Knoxville", "Chattanooga"], avgGroundCostLbs: 4.55, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Memphis International Airport (FedEx World Hub)"], shippingVolumeRank: 4 },
  { slug: "texas", name: "Texas", code: "TX", shippingHubs: ["Dallas", "Houston", "San Antonio", "Austin", "Fort Worth", "El Paso"], avgGroundCostLbs: 4.75, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Houston", "Port of Laredo", "Dallas/Fort Worth International Airport", "Port of El Paso", "Port of Brownsville"], shippingVolumeRank: 2 },
  { slug: "utah", name: "Utah", code: "UT", shippingHubs: ["Salt Lake City", "Provo", "Ogden"], avgGroundCostLbs: 5.10, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 26 },
  { slug: "vermont", name: "Vermont", code: "VT", shippingHubs: ["Burlington", "Montpelier"], avgGroundCostLbs: 5.50, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Derby Line Port of Entry", "Highgate Springs Port of Entry"], shippingVolumeRank: 50 },
  { slug: "virginia", name: "Virginia", code: "VA", shippingHubs: ["Norfolk", "Richmond", "Virginia Beach", "Arlington"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Virginia (Norfolk)", "Washington Dulles International Airport"], shippingVolumeRank: 13 },
  { slug: "washington", name: "Washington", code: "WA", shippingHubs: ["Seattle", "Tacoma", "Spokane"], avgGroundCostLbs: 5.15, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Seattle", "Port of Tacoma", "Seattle-Tacoma International Airport", "Blaine Port of Entry"], shippingVolumeRank: 9 },
  { slug: "west-virginia", name: "West Virginia", code: "WV", shippingHubs: ["Charleston", "Huntington"], avgGroundCostLbs: 5.10, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 41 },
  { slug: "wisconsin", name: "Wisconsin", code: "WI", shippingHubs: ["Milwaukee", "Madison", "Green Bay"], avgGroundCostLbs: 4.85, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: ["Port of Milwaukee", "Port of Green Bay"], shippingVolumeRank: 20 },
  { slug: "wyoming", name: "Wyoming", code: "WY", shippingHubs: ["Cheyenne", "Casper"], avgGroundCostLbs: 5.60, carriers: { usps: true, ups: true, fedex: true }, portsOfEntry: [], shippingVolumeRank: 51 },
];

export function getAllStates(): StateData[] {
  return states;
}

export function getStateBySlug(slug: string): StateData | undefined {
  return states.find((s) => s.slug === slug);
}

export function getAvgGroundCostNational(): number {
  const total = states.reduce((sum, s) => sum + s.avgGroundCostLbs, 0);
  return total / states.length;
}
