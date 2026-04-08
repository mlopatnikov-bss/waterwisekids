// WaterWiseKids Swim School Directory Data
// Verified swim school listings organized by state
// Data sources: Official chain websites, Indeed.com company profiles
// Last updated: April 2026
//
// Note: For the most current location details (addresses, phone numbers),
// please visit each school's website directly.

const SWIM_SCHOOLS_DATA = {
  "AL": [
    { name: "Goldfish Swim School - Birmingham", chain: "Goldfish Swim School", city: "Birmingham", state: "AL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Hoover", chain: "Goldfish Swim School", city: "Hoover", state: "AL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Mobile", chain: "Emler Swim School", city: "Mobile", state: "AL", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "AK": [
    { name: "YMCA Alaska - Anchorage", chain: "YMCA", city: "Anchorage", state: "AK", website: "https://ymcaalaska.org/programs/aquatics/swim-lessons/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "The Alaska Club Starfish Academy", chain: "The Alaska Club", city: "Anchorage", state: "AK", website: "https://www.thealaskaclub.com/youth-and-family/starfish-academy-swim-lessons", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aquatic Foundation of Alaska", chain: "Independent", city: "Anchorage", state: "AK", website: "https://www.swimyetiswim.com/", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "AZ": [
    { name: "Aqua-Tots - Ahwatukee", chain: "Aqua-Tots", city: "Ahwatukee", state: "AZ", website: "https://www.aqua-tots.com/ahwatukee/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Chandler", chain: "Aqua-Tots", city: "Chandler", state: "AZ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Mesa", chain: "Aqua-Tots", city: "Mesa", state: "AZ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Peoria", chain: "Aqua-Tots", city: "Peoria", state: "AZ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Phoenix", chain: "Aqua-Tots", city: "Phoenix", state: "AZ", website: "https://www.aqua-tots.com/central-phoenix/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Queen Creek", chain: "Aqua-Tots", city: "Queen Creek", state: "AZ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Scottsdale", chain: "Aqua-Tots", city: "Scottsdale", state: "AZ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Surprise", chain: "Aqua-Tots", city: "Surprise", state: "AZ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - North Scottsdale", chain: "Goldfish Swim School", city: "Phoenix", state: "AZ", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Scottsdale", chain: "SafeSplash", city: "Scottsdale", state: "AZ", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "AR": [
    { name: "Goldfish Swim School - Rogers", chain: "Goldfish Swim School", city: "Rogers", state: "AR", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ,
    { name: "SafeSplash - Little Rock West", chain: "SafeSplash", city: "Little Rock", state: "AR", website: "https://www.safesplash.com/locations/little-rock-west-ar", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Little Rock Midtown", chain: "SafeSplash", city: "Little Rock", state: "AR", website: "https://www.safesplash.com/locations/little-rock-midtown-ar", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Diventures Swim School", chain: "Independent", city: "Little Rock", state: "AR", website: "https://www.diventures.com/locations/littlerock/swim/", programs: ["preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Safety Before Skill", chain: "Independent", city: "Little Rock", state: "AR", website: "https://www.safetybeforeskill.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Arkansas Swim Academy", chain: "Independent", city: "Fayetteville", state: "AR", website: "https://arkansasswimacademy.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "CA": [
    { name: "British Swim School of Daly City", chain: "British Swim School", city: "Daly City", state: "CA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Richmond", chain: "British Swim School", city: "Richmond", state: "CA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of San Francisco", chain: "British Swim School", city: "San Francisco", state: "CA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of South San Francisco", chain: "British Swim School", city: "South San Francisco", state: "CA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Aliso Viejo", chain: "Goldfish Swim School", city: "Aliso Viejo", state: "CA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Anaheim", chain: "Aqua-Tots", city: "Anaheim", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Chula Vista", chain: "Aqua-Tots", city: "Chula Vista", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Costa Mesa", chain: "Aqua-Tots", city: "Costa Mesa", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Hawaiian Gardens", chain: "Aqua-Tots", city: "Hawaiian Gardens", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Orange", chain: "Aqua-Tots", city: "Orange", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Rancho Cucamonga", chain: "Aqua-Tots", city: "Rancho Cucamonga", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Tustin", chain: "Aqua-Tots", city: "Tustin", state: "CA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Elk Grove", chain: "SafeSplash", city: "Elk Grove", state: "CA", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - San Jose", chain: "SafeSplash", city: "San Jose", state: "CA", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Foothill Ranch", chain: "Emler Swim School", city: "Foothill Ranch", state: "CA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Murrieta", chain: "Emler Swim School", city: "Murrieta", state: "CA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - San Carlos", chain: "Emler Swim School", city: "San Carlos", state: "CA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - San Mateo", chain: "Emler Swim School", city: "San Mateo", state: "CA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Waterworks Aquatics - Irvine", chain: "Waterworks Aquatics", city: "Irvine", state: "CA", website: "https://www.waterworksswim.com/locations/irvine", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Waterworks Aquatics - Pasadena", chain: "Waterworks Aquatics", city: "Pasadena", state: "CA", website: "https://www.waterworksswim.com/locations/pasadena", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Waterworks Aquatics - San Francisco", chain: "Waterworks Aquatics", city: "San Francisco", state: "CA", website: "https://www.waterworksswim.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Waterworks Aquatics - San Jose", chain: "Waterworks Aquatics", city: "San Jose", state: "CA", website: "https://www.waterworksswim.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Waterworks Aquatics - Santa Clarita", chain: "Waterworks Aquatics", city: "Santa Clarita", state: "CA", website: "https://www.waterworksswim.com/locations/santa-clarita", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Waterworks Aquatics - Torrance", chain: "Waterworks Aquatics", city: "Torrance", state: "CA", website: "https://www.waterworksswim.com/locations/torrance", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "CO": [
    { name: "Goldfish Swim School - Denver", chain: "Goldfish Swim School", city: "Denver", state: "CO", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Superior", chain: "Goldfish Swim School", city: "Superior", state: "CO", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Littleton", chain: "Aqua-Tots", city: "Littleton", state: "CO", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Lone Tree", chain: "Aqua-Tots", city: "Lone Tree", state: "CO", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Aurora", chain: "SafeSplash", city: "Aurora", state: "CO", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Castle Rock", chain: "SafeSplash", city: "Castle Rock", state: "CO", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Denver", chain: "SafeSplash", city: "Denver", state: "CO", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Lone Tree", chain: "SafeSplash", city: "Lone Tree", state: "CO", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Parker", chain: "SafeSplash", city: "Parker", state: "CO", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Centennial", chain: "Big Blue Swim School", city: "Centennial", state: "CO", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "CT": [
    { name: "Goldfish Swim School - Norwalk", chain: "Goldfish Swim School", city: "Norwalk", state: "CT", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Stamford", chain: "Goldfish Swim School", city: "Stamford", state: "CT", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ,
    { name: "Chelsea Piers Swim School", chain: "Chelsea Piers", city: "Stamford", state: "CT", website: "https://sports.chelseapiers.com/connecticut/stamford/sports/swimming/classes", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Hudson Valley Swim - Stamford", chain: "Hudson Valley Swim", city: "Stamford", state: "CT", website: "https://stamford.hvswim.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "DE": [
    { name: "Goldfish Swim School - Pike Creek", chain: "Goldfish Swim School", city: "Pike Creek", state: "DE", website: "https://goldfishswimschool.com/pike-creek/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "British Swim School of Northern Delaware", chain: "British Swim School", city: "Newark", state: "DE", website: "https://britishswimschool.com/northern-delaware/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Swim School Inc. - Newark", chain: "Independent", city: "Newark", state: "DE", website: "https://www.swimschoolinc.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Delaware Swim School", chain: "Independent", city: "Wilmington", state: "DE", website: "https://delawareswimschool.com/", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "DC": [
    { name: "Old City Swim School", chain: "Independent", city: "Washington", state: "DC", website: "https://oldcityswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "WeAquatics Swim School", chain: "Independent", city: "Washington", state: "DC", website: "https://weaquatics.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Columbia Heights", chain: "SafeSplash", city: "Washington", state: "DC", website: "https://www.safesplash.com/locations/columbia-heights-dc", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of North Washington D.C.", chain: "British Swim School", city: "Washington", state: "DC", website: "https://britishswimschool.com/north-washington-dc-capital-suburbs/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Capital Splash Swim Academy", chain: "Independent", city: "Washington", state: "DC", website: "https://capitalsplash.org/", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "FL": [
    { name: "British Swim School of Hialeah", chain: "British Swim School", city: "Hialeah", state: "FL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Miami", chain: "British Swim School", city: "Miami", state: "FL", website: "https://britishswimschool.com/greater-miami/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Orlando", chain: "British Swim School", city: "Orlando", state: "FL", website: "https://britishswimschool.com/south-orlando/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Pembroke Pines", chain: "British Swim School", city: "Pembroke Pines", state: "FL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Sunrise", chain: "British Swim School", city: "Sunrise", state: "FL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Wellington", chain: "British Swim School", city: "Wellington", state: "FL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Bonita Springs", chain: "Goldfish Swim School", city: "Bonita Springs", state: "FL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Coral Springs", chain: "Goldfish Swim School", city: "Coral Springs", state: "FL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Pembroke Pines", chain: "Goldfish Swim School", city: "Pembroke Pines", state: "FL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Winter Park", chain: "Goldfish Swim School", city: "Winter Park", state: "FL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Sarasota", chain: "Aqua-Tots", city: "Sarasota", state: "FL", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Pembroke Pines", chain: "Big Blue Swim School", city: "Pembroke Pines", state: "FL", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Jacksonville", chain: "Emler Swim School", city: "Jacksonville", state: "FL", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Orange City", chain: "Emler Swim School", city: "Orange City", state: "FL", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "GA": [
    { name: "British Swim School of Atlanta", chain: "British Swim School", city: "Atlanta", state: "GA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Johns Creek", chain: "Goldfish Swim School", city: "Johns Creek", state: "GA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Roswell", chain: "Goldfish Swim School", city: "Roswell", state: "GA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Sandy Springs", chain: "Goldfish Swim School", city: "Sandy Springs", state: "GA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Alpharetta", chain: "Aqua-Tots", city: "Alpharetta", state: "GA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Atlanta", chain: "Aqua-Tots", city: "Atlanta", state: "GA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Douglasville", chain: "Aqua-Tots", city: "Douglasville", state: "GA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Kennesaw", chain: "Aqua-Tots", city: "Kennesaw", state: "GA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Marietta", chain: "Aqua-Tots", city: "Marietta", state: "GA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Roswell", chain: "Aqua-Tots", city: "Roswell", state: "GA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Johns Creek", chain: "Big Blue Swim School", city: "Johns Creek", state: "GA", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "HI": [
    { name: "Swim Lessons Hawaii", chain: "Independent", city: "Honolulu", state: "HI", website: "https://www.swimlessonshawaii.co", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: false, yearRound: true },
    { name: "Leahi Swim School", chain: "Independent", city: "Honolulu", state: "HI", website: "https://www.leahiswimschool.com/", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Honolulu Swim School", chain: "Independent", city: "Honolulu", state: "HI", website: "https://www.honoluluswimschool.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: false, yearRound: true },
    { name: "Little Honu Swim School", chain: "Independent", city: "Kihei", state: "HI", website: "https://www.lhswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: false, yearRound: true }
  ],
  "ID": [
    { name: "Goldfish Swim School - Boise", chain: "Goldfish Swim School", city: "Boise", state: "ID", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Boise", chain: "Aqua-Tots", city: "Boise", state: "ID", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Eagle", chain: "Aqua-Tots", city: "Eagle", state: "ID", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "IL": [
    { name: "British Swim School of Chicago", chain: "British Swim School", city: "Chicago", state: "IL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Elmhurst", chain: "British Swim School", city: "Elmhurst", state: "IL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Glendale Heights", chain: "British Swim School", city: "Glendale Heights", state: "IL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Naperville", chain: "British Swim School", city: "Naperville", state: "IL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Tinley Park", chain: "British Swim School", city: "Tinley Park", state: "IL", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Arlington Heights", chain: "Goldfish Swim School", city: "Arlington Heights", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Burr Ridge", chain: "Goldfish Swim School", city: "Burr Ridge", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Elmhurst", chain: "Goldfish Swim School", city: "Elmhurst", state: "IL", website: "https://goldfishswimschool.com/elmhurst/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Evanston", chain: "Goldfish Swim School", city: "Evanston", state: "IL", website: "https://goldfishswimschool.com/evanston/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Glen Ellyn", chain: "Goldfish Swim School", city: "Glen Ellyn", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Mundelein", chain: "Goldfish Swim School", city: "Mundelein", state: "IL", website: "https://goldfishswimschool.com/mundelein/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Naperville", chain: "Goldfish Swim School", city: "Naperville", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Northbrook", chain: "Goldfish Swim School", city: "Northbrook", state: "IL", website: "https://goldfishswimschool.com/northbrook/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Park Ridge", chain: "Goldfish Swim School", city: "Park Ridge", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Plainfield", chain: "Goldfish Swim School", city: "Plainfield", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Saint Charles", chain: "Goldfish Swim School", city: "Saint Charles", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Wicker Park", chain: "Goldfish Swim School", city: "Chicago", state: "IL", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Orland Park", chain: "Aqua-Tots", city: "Orland Park", state: "IL", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Wheaton", chain: "Aqua-Tots", city: "Wheaton", state: "IL", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Buffalo Grove", chain: "Big Blue Swim School", city: "Buffalo Grove", state: "IL", website: "https://bigblueswimschool.com/locations/illinois/buffalo-grove/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Chicago", chain: "Big Blue Swim School", city: "Chicago", state: "IL", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Hoffman Estates", chain: "Big Blue Swim School", city: "Hoffman Estates", state: "IL", website: "https://bigblueswimschool.com/locations/illinois/hoffman-estates/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Niles", chain: "Big Blue Swim School", city: "Niles", state: "IL", website: "https://bigblueswimschool.com/locations/illinois/niles/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Wilmette", chain: "Big Blue Swim School", city: "Wilmette", state: "IL", website: "https://bigblueswimschool.com/locations/illinois/wilmette/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Aurora", chain: "Bear Paddle Swim School", city: "Aurora", state: "IL", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Bloomingdale", chain: "Bear Paddle Swim School", city: "Bloomingdale", state: "IL", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Lake in the Hills", chain: "Bear Paddle Swim School", city: "Lake in the Hills", state: "IL", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Orland Park", chain: "Bear Paddle Swim School", city: "Orland Park", state: "IL", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Woodridge", chain: "Bear Paddle Swim School", city: "Woodridge", state: "IL", website: "https://www.bearpaddle.com/locations/woodridge-illinois-swimming-lessons/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "IN": [
    { name: "British Swim School of Indianapolis", chain: "British Swim School", city: "Indianapolis", state: "IN", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Carmel", chain: "Goldfish Swim School", city: "Carmel", state: "IN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Fishers", chain: "Goldfish Swim School", city: "Fishers", state: "IN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Greenwood", chain: "Goldfish Swim School", city: "Greenwood", state: "IN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Indianapolis", chain: "Aqua-Tots", city: "Indianapolis", state: "IN", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Schererville", chain: "Aqua-Tots", city: "Schererville", state: "IN", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Fort Wayne", chain: "Emler Swim School", city: "Fort Wayne", state: "IN", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Noblesville", chain: "Emler Swim School", city: "Noblesville", state: "IN", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "IA": [
    { name: "Goldfish Swim School - Urbandale", chain: "Goldfish Swim School", city: "Urbandale", state: "IA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Des Moines", chain: "Aqua-Tots", city: "Des Moines", state: "IA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - West Des Moines", chain: "Aqua-Tots", city: "West Des Moines", state: "IA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "KS": [
    { name: "Goldfish Swim School - Lenexa", chain: "Goldfish Swim School", city: "Lenexa", state: "KS", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Overland Park", chain: "Goldfish Swim School", city: "Overland Park", state: "KS", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Olathe", chain: "Aqua-Tots", city: "Olathe", state: "KS", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Leawood", chain: "Emler Swim School", city: "Leawood", state: "KS", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "KY": [
    { name: "Aqua-Tots - Lexington", chain: "Aqua-Tots", city: "Lexington", state: "KY", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Louisville", chain: "Aqua-Tots", city: "Louisville", state: "KY", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Louisville", chain: "SafeSplash", city: "Louisville", state: "KY", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Florence", chain: "Bear Paddle Swim School", city: "Florence", state: "KY", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Louisville", chain: "Bear Paddle Swim School", city: "Louisville", state: "KY", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "LA": [
    { name: "Crawfish Swim School", chain: "Independent", city: "Baton Rouge", state: "LA", website: "https://crawfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Tadpole Academy", chain: "Independent", city: "Prairieville", state: "LA", website: "https://tadpoleacademy.com/", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Safe Swim Kids", chain: "Independent", city: "Metairie", state: "LA", website: "https://www.safeswimkids.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Love Swimming", chain: "Independent", city: "New Orleans", state: "LA", website: "https://loveswimming.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Seven Seas Swim School", chain: "Independent", city: "Baton Rouge", state: "LA", website: "https://www.sevenseasbtr.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "ME": [
    { name: "Goldfish Swim School - Portland", chain: "Goldfish Swim School", city: "Portland", state: "ME", website: "https://goldfishswimschool.com/portland/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Little Waves Swim Academy", chain: "Independent", city: "South Portland", state: "ME", website: "https://www.littlewavesswim.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "MD": [
    { name: "British Swim School of Bethesda", chain: "British Swim School", city: "Bethesda", state: "MD", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Gaithersburg", chain: "British Swim School", city: "Gaithersburg", state: "MD", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Columbia", chain: "Goldfish Swim School", city: "Columbia", state: "MD", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Gaithersburg", chain: "Goldfish Swim School", city: "Gaithersburg", state: "MD", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Owings Mills", chain: "Goldfish Swim School", city: "Owings Mills", state: "MD", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Rockville", chain: "Goldfish Swim School", city: "Rockville", state: "MD", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Silver Spring", chain: "Goldfish Swim School", city: "Silver Spring", state: "MD", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Ellicott City", chain: "SafeSplash", city: "Ellicott City", state: "MD", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SwimLabs - Gaithersburg", chain: "SwimLabs", city: "Gaithersburg", state: "MD", website: "https://www.swimlabs.com/locations/montgomery-county-md", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "MA": [
    { name: "Goldfish Swim School - Braintree", chain: "Goldfish Swim School", city: "Braintree", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Brookline", chain: "Goldfish Swim School", city: "Brookline", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Burlington", chain: "Goldfish Swim School", city: "Burlington", state: "MA", website: "https://goldfishswimschool.com/burlington/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Danvers", chain: "Goldfish Swim School", city: "Danvers", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Marlborough", chain: "Goldfish Swim School", city: "Marlborough", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Needham", chain: "Goldfish Swim School", city: "Needham", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Norwood", chain: "Goldfish Swim School", city: "Norwood", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Rockland", chain: "Goldfish Swim School", city: "Rockland", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Westford", chain: "Goldfish Swim School", city: "Westford", state: "MA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Norwood", chain: "Aqua-Tots", city: "Norwood", state: "MA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Natick", chain: "Emler Swim School", city: "Natick", state: "MA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Winchester", chain: "Emler Swim School", city: "Winchester", state: "MA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "MI": [
    { name: "Goldfish Swim School - Ann Arbor", chain: "Goldfish Swim School", city: "Ann Arbor", state: "MI", website: "https://goldfishswimschool.com/ann-arbor", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Birmingham", chain: "Goldfish Swim School", city: "Birmingham", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Canton", chain: "Goldfish Swim School", city: "Canton", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Clarkston", chain: "Goldfish Swim School", city: "Clarkston", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Farmington Hills", chain: "Goldfish Swim School", city: "Farmington Hills", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Grand Rapids", chain: "Goldfish Swim School", city: "Grand Rapids", state: "MI", website: "https://goldfishswimschool.com/grand-rapids/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Macomb", chain: "Goldfish Swim School", city: "Macomb", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Okemos", chain: "Goldfish Swim School", city: "Okemos", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Rochester Hills", chain: "Goldfish Swim School", city: "Rochester Hills", state: "MI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Auburn Hills", chain: "Aqua-Tots", city: "Auburn Hills", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Canton", chain: "Aqua-Tots", city: "Canton", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Dearborn", chain: "Aqua-Tots", city: "Dearborn", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Farmington Hills", chain: "Aqua-Tots", city: "Farmington Hills", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Novi", chain: "Aqua-Tots", city: "Novi", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Sterling Heights", chain: "Aqua-Tots", city: "Sterling Heights", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Troy", chain: "Aqua-Tots", city: "Troy", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Woodhaven", chain: "Aqua-Tots", city: "Woodhaven", state: "MI", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Royal Oak", chain: "SafeSplash", city: "Royal Oak", state: "MI", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Ann Arbor", chain: "Big Blue Swim School", city: "Ann Arbor", state: "MI", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "MN": [
    { name: "Goldfish Swim School - Eagan", chain: "Goldfish Swim School", city: "Eagan", state: "MN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Oakdale", chain: "Goldfish Swim School", city: "Oakdale", state: "MN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - Blaine", chain: "Foss Swim School", city: "Blaine", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/blaine-minnesota-55449/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - Chanhassen", chain: "Foss Swim School", city: "Chanhassen", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/chanhassen-minnesota-55317/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - Maple Grove", chain: "Foss Swim School", city: "Maple Grove", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/maple-grove-minnesota-55311/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - Plymouth", chain: "Foss Swim School", city: "Plymouth", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/plymouth-orono-medina-wayzata-minnetonka-minnesota-55447/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - Savage", chain: "Foss Swim School", city: "Savage", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/savage-minnesota-55378/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - St. Louis Park", chain: "Foss Swim School", city: "St. Louis Park", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/st-louis-park-minnesota-55426/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - St. Paul", chain: "Foss Swim School", city: "St. Paul", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/st-paul-minnesota-55104/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Foss Swim School - Vadnais Heights", chain: "Foss Swim School", city: "Vadnais Heights", state: "MN", website: "https://www.fossswimschool.com/swimming-lesson-locations/vadnais-heights-mn/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "MS": [
    { name: "Emler Swim School - Hattiesburg", chain: "Emler Swim School", city: "Hattiesburg", state: "MS", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ,
    { name: "Maley Swim School", chain: "Independent", city: "Ridgeland", state: "MS", website: "https://www.yelp.com/biz/maley-swim-school-ridgeland", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "MO": [
    { name: "British Swim School of St. Louis", chain: "British Swim School", city: "St. Louis", state: "MO", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Union", chain: "Emler Swim School", city: "Union", state: "MO", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ,
    { name: "Goldfish Swim School - St. Louis", chain: "Goldfish Swim School", city: "St. Louis", state: "MO", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "MT": [
    { name: "Montana Swim Academy", chain: "Independent", city: "Billings", state: "MT", website: "https://montanaswimacademy.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Barracuda Swim Club", chain: "Independent", city: "Billings", state: "MT", website: "https://barracudaswim.club/", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Granite Swim Lessons", chain: "Independent", city: "Billings", state: "MT", website: "https://granitebillings.com/pages/swimlessons", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "NE": [
    { name: "Goldfish Swim School - Omaha", chain: "Goldfish Swim School", city: "Omaha", state: "NE", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Omaha", chain: "Aqua-Tots", city: "Omaha", state: "NE", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "NV": [
    { name: "Aqua-Tots - Las Vegas", chain: "Aqua-Tots", city: "Las Vegas", state: "NV", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Las Vegas", chain: "SafeSplash", city: "Las Vegas", state: "NV", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Henderson", chain: "Emler Swim School", city: "Henderson", state: "NV", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Las Vegas", chain: "Emler Swim School", city: "Las Vegas", state: "NV", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "NH": [
    { name: "NH Swim School", chain: "Independent", city: "Nashua", state: "NH", website: "https://nhswimschool.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "NJ": [
    // British Swim School - Jersey Shore
    { name: "British Swim School at LA Fitness Brick", chain: "British Swim School", city: "Brick Township", state: "NJ", website: "https://britishswimschool.com/jersey-shore/location/la-fitness-brick/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Boys & Girls Club Asbury Park", chain: "British Swim School", city: "Asbury Park", state: "NJ", website: "https://britishswimschool.com/jersey-shore/location/boys-girls-club/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at LA Fitness Toms River", chain: "British Swim School", city: "Toms River", state: "NJ", website: "https://britishswimschool.com/jersey-shore/location/la-fitness-toms-river/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at LA Fitness Howell", chain: "British Swim School", city: "Howell", state: "NJ", website: "https://britishswimschool.com/jersey-shore/location/la-fitness-howell/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    // British Swim School - North New Jersey
    { name: "British Swim School at UFC Fitness Wayne", chain: "British Swim School", city: "Wayne", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/ufc-fitness-wayne/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Pingry School Basking Ridge", chain: "British Swim School", city: "Basking Ridge", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/pingry-school-basking-ridge/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at LA Fitness Parsippany", chain: "British Swim School", city: "Parsippany", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/la-fitness-parsippany/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at LA Fitness Kearny", chain: "British Swim School", city: "Kearny", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/la-fitness-kearny/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at LA Fitness Edison", chain: "British Swim School", city: "Edison", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/la-fitnes-edison/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at LA Fitness East Brunswick", chain: "British Swim School", city: "East Brunswick", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/la-fitness-east-brunswick/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Crunch Fitness Morristown", chain: "British Swim School", city: "Morristown", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/crunch-fitness-hyatt-morristown/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at 24 Hour Fitness Piscataway", chain: "British Swim School", city: "Piscataway", state: "NJ", website: "https://britishswimschool.com/north-new-jersey/location/24-hour-fitness-piscataway/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    // British Swim School - Hudson Waterfront
    { name: "British Swim School at Cliffside Park", chain: "British Swim School", city: "Cliffside Park", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/cliffside-park/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Xchange Secaucus", chain: "British Swim School", city: "Secaucus", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/xchange-at-secaucus-junction/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Winchester Gardens Maplewood", chain: "British Swim School", city: "Maplewood", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/winchester-gardens-maplewood/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at PS27 Jersey City Heights", chain: "British Swim School", city: "Jersey City", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/ps27-jersey-city-heights/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at PS22 Jersey City Bergen-Lafayette", chain: "British Swim School", city: "Jersey City", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/ps22-jc/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at PS16 Jersey City Paulus Hook", chain: "British Swim School", city: "Jersey City", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/ps16-jersey-city-paulus-hook/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Home2 Suites Newark", chain: "British Swim School", city: "Newark", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/home2-suites-ewr-airport/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at JCC Bayonne", chain: "British Swim School", city: "Bayonne", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/jewish-community-center-of-bayonne/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Fairfield Route 46", chain: "British Swim School", city: "Fairfield", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/fairfield-route-46/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Clifton Sport & Fitness", chain: "British Swim School", city: "Clifton", state: "NJ", website: "https://britishswimschool.com/hudson-waterfront/location/clifton-sport-fitness/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    // British Swim School - North Central NJ
    { name: "British Swim School at Marriott Courtyard Somerset", chain: "British Swim School", city: "Somerset", state: "NJ", website: "https://britishswimschool.com/north-central-new-jersey/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at 24 Hour Fitness Springfield", chain: "British Swim School", city: "Springfield", state: "NJ", website: "https://britishswimschool.com/north-central-new-jersey/location/24-hour-fitness-springfield/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Clarion Inn Somerset", chain: "British Swim School", city: "Somerset", state: "NJ", website: "https://britishswimschool.com/north-central-new-jersey/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Pinnacle Hillsborough", chain: "British Swim School", city: "Hillsborough Township", state: "NJ", website: "https://britishswimschool.com/north-central-new-jersey/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at Pennington", chain: "British Swim School", city: "Pennington", state: "NJ", website: "https://britishswimschool.com/north-central-new-jersey/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School at MCCC West Windsor", chain: "British Swim School", city: "West Windsor Township", state: "NJ", website: "https://britishswimschool.com/north-central-new-jersey/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    // British Swim School - South Jersey
    { name: "British Swim School at Echelon Voorhees", chain: "British Swim School", city: "Voorhees Township", state: "NJ", website: "https://britishswimschool.com/greater-philadelphia-south-jersey/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Closter", chain: "Goldfish Swim School", city: "Closter", state: "NJ", website: "https://goldfishswimschool.com/closter/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Denville", chain: "Goldfish Swim School", city: "Denville", state: "NJ", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Edison", chain: "Goldfish Swim School", city: "Edison", state: "NJ", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Livingston", chain: "Goldfish Swim School", city: "Livingston", state: "NJ", website: "https://goldfishswimschool.com/livingston/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Manalapan", chain: "Goldfish Swim School", city: "Manalapan", state: "NJ", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Middletown", chain: "Goldfish Swim School", city: "Middletown", state: "NJ", website: "https://goldfishswimschool.com/middletown/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Mount Laurel", chain: "Goldfish Swim School", city: "Mount Laurel", state: "NJ", website: "https://goldfishswimschool.com/mount-laurel/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Red Bank", chain: "Goldfish Swim School", city: "Red Bank", state: "NJ", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Springfield", chain: "Goldfish Swim School", city: "Springfield", state: "NJ", website: "https://goldfishswimschool.com/springfield/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Wyckoff", chain: "Goldfish Swim School", city: "Wyckoff", state: "NJ", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Clark", chain: "Aqua-Tots", city: "Clark", state: "NJ", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Toms River", chain: "Aqua-Tots", city: "Toms River", state: "NJ", website: "https://www.aqua-tots.com/toms-river/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Paramus", chain: "SafeSplash", city: "Paramus", state: "NJ", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Marlton", chain: "Bear Paddle Swim School", city: "Marlton", state: "NJ", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Turnersville", chain: "Bear Paddle Swim School", city: "Turnersville", state: "NJ", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Florham Park", chain: "Emler Swim School", city: "Florham Park", state: "NJ", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Manasquan", chain: "Emler Swim School", city: "Manasquan", state: "NJ", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Sparta", chain: "Emler Swim School", city: "Sparta", state: "NJ", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "NM": [
    { name: "505 Swimming - Albuquerque", chain: "505 Swimming", city: "Albuquerque", state: "NM", website: "https://www.505swimming.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "505 Swimming - Santa Fe", chain: "505 Swimming", city: "Santa Fe", state: "NM", website: "https://www.505swimming.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SwimWorks Swim School", chain: "Independent", city: "Albuquerque", state: "NM", website: "https://www.swimworksswimschool.com/albuquerque", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Green Feet Swimming", chain: "Independent", city: "Albuquerque", state: "NM", website: "https://greenfeetswimming.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "NY": [
    { name: "British Swim School of Brooklyn", chain: "British Swim School", city: "Brooklyn", state: "NY", website: "https://britishswimschool.com/brooklyn-queens/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Long Island", chain: "British Swim School", city: "Long Island", state: "NY", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Manhattan", chain: "British Swim School", city: "New York", state: "NY", website: "https://britishswimschool.com/manhattan/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Astoria", chain: "Goldfish Swim School", city: "Astoria", state: "NY", website: "https://goldfishswimschool.com/astoria/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Brooklyn", chain: "Goldfish Swim School", city: "Brooklyn", state: "NY", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Farmingdale", chain: "Goldfish Swim School", city: "Farmingdale", state: "NY", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Garden City", chain: "Goldfish Swim School", city: "Garden City", state: "NY", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - New York", chain: "Goldfish Swim School", city: "New York", state: "NY", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Rochester", chain: "Goldfish Swim School", city: "Rochester", state: "NY", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Williamsville", chain: "Goldfish Swim School", city: "Williamsville", state: "NY", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SwimJim - New York", chain: "SwimJim", city: "New York", state: "NY", website: "https://www.swimjim.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SwimJim - Brooklyn", chain: "SwimJim", city: "Brooklyn", state: "NY", website: "https://www.swimjim.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SwimLabs - Westchester", chain: "SwimLabs", city: "Elmsford", state: "NY", website: "https://www.swimlabs.com/locations/westchester-ny", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "NC": [
    { name: "Goldfish Swim School - Cary", chain: "Goldfish Swim School", city: "Cary", state: "NC", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Chapel Hill", chain: "Goldfish Swim School", city: "Chapel Hill", state: "NC", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Raleigh", chain: "Goldfish Swim School", city: "Raleigh", state: "NC", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Wake Forest", chain: "Goldfish Swim School", city: "Wake Forest", state: "NC", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Cary", chain: "Aqua-Tots", city: "Cary", state: "NC", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Charlotte", chain: "Aqua-Tots", city: "Charlotte", state: "NC", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Holly Springs", chain: "Aqua-Tots", city: "Holly Springs", state: "NC", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Matthews", chain: "Aqua-Tots", city: "Matthews", state: "NC", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Raleigh", chain: "Aqua-Tots", city: "Raleigh", state: "NC", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Morrisville", chain: "SafeSplash", city: "Morrisville", state: "NC", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Pineville", chain: "Big Blue Swim School", city: "Pineville", state: "NC", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "ND": [
    { name: "Foss Swim School - Fargo", chain: "Foss Swim School", city: "Fargo", state: "ND", website: "https://www.fossswimschool.com/swimming-lesson-locations/fargo-nd/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Family Wellness Swim School", chain: "Independent", city: "Fargo", state: "ND", website: "https://www.familywellnessfargo.org/youth-family/swim-school/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "OH": [
    { name: "Goldfish Swim School - Cincinnati", chain: "Goldfish Swim School", city: "Cincinnati", state: "OH", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Columbus", chain: "Goldfish Swim School", city: "Columbus", state: "OH", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Dublin", chain: "Goldfish Swim School", city: "Dublin", state: "OH", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Hudson", chain: "Goldfish Swim School", city: "Hudson", state: "OH", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Strongsville", chain: "Goldfish Swim School", city: "Strongsville", state: "OH", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Westerville", chain: "Goldfish Swim School", city: "Westerville", state: "OH", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Beavercreek", chain: "Aqua-Tots", city: "Beavercreek", state: "OH", website: "https://www.aqua-tots.com/beavercreek/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Columbus", chain: "Aqua-Tots", city: "Columbus", state: "OH", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Powell", chain: "Aqua-Tots", city: "Powell", state: "OH", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Springboro", chain: "Aqua-Tots", city: "Springboro", state: "OH", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Westerville", chain: "Aqua-Tots", city: "Westerville", state: "OH", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Westlake", chain: "Aqua-Tots", city: "Westlake", state: "OH", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Columbus", chain: "SafeSplash", city: "Columbus", state: "OH", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Cincinnati", chain: "Bear Paddle Swim School", city: "Cincinnati", state: "OH", website: "https://www.bearpaddle.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Bear Paddle Swim School - Mason", chain: "Bear Paddle Swim School", city: "Mason", state: "OH", website: "https://www.bearpaddle.com/locations/mason-ohio-swimming-lessons/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "OK": [
    { name: "Goldfish Swim School - Edmond", chain: "Goldfish Swim School", city: "Edmond", state: "OK", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Oklahoma City", chain: "Aqua-Tots", city: "Oklahoma City", state: "OK", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "OR": [
    { name: "SWIMBABES", chain: "Independent", city: "Milwaukie", state: "OR", website: "https://www.swimbabes.com/", programs: ["infant", "toddler", "preschool"], indoor: true, yearRound: true },
    { name: "Children of the Sea Swim School", chain: "Independent", city: "Portland", state: "OR", website: "https://www.childrenofthesea.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "PA": [
    { name: "British Swim School of Bensalem", chain: "British Swim School", city: "Bensalem", state: "PA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Lancaster", chain: "British Swim School", city: "Lancaster", state: "PA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Philadelphia", chain: "British Swim School", city: "Philadelphia", state: "PA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Pittsburgh", chain: "British Swim School", city: "Pittsburgh", state: "PA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Wexford", chain: "British Swim School", city: "Wexford", state: "PA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Bethlehem", chain: "Goldfish Swim School", city: "Bethlehem", state: "PA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Fort Washington", chain: "Goldfish Swim School", city: "Fort Washington", state: "PA", website: "https://goldfishswimschool.com/fort-washington/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Malvern", chain: "Goldfish Swim School", city: "Malvern", state: "PA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Media", chain: "Goldfish Swim School", city: "Media", state: "PA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Pittsburgh", chain: "Goldfish Swim School", city: "Pittsburgh", state: "PA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Wexford", chain: "Goldfish Swim School", city: "Wexford", state: "PA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Horsham", chain: "Aqua-Tots", city: "Horsham", state: "PA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Paoli", chain: "Big Blue Swim School", city: "Paoli", state: "PA", website: "https://bigblueswimschool.com/locations/pennsylvania/paoli/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "RI": [
    { name: "Goldfish Swim School - Warwick", chain: "Goldfish Swim School", city: "Warwick", state: "RI", website: "https://goldfishswimschool.com/warwick/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Pods Swimming", chain: "Independent", city: "Providence", state: "RI", website: "https://www.podsswimming.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "SC": [
    { name: "Goldfish Swim School - Greenville", chain: "Goldfish Swim School", city: "Greenville", state: "SC", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ,
    { name: "Charleston Swim School", chain: "Independent", city: "Charleston", state: "SC", website: "https://charlestonswimlessons.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Swim Savvy Aquatics", chain: "Independent", city: "Greenville", state: "SC", website: "https://www.swimsavvyaquatics.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Simpsonville", chain: "SafeSplash", city: "Simpsonville", state: "SC", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "SD": [
    { name: "SafeSplash - Sioux Falls South", chain: "SafeSplash", city: "Sioux Falls", state: "SD", website: "https://www.safesplash.com/locations/sioux-falls-south-sd", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Sioux Falls East", chain: "SafeSplash", city: "Sioux Falls", state: "SD", website: "https://www.safesplash.com/locations/sioux-falls-east-sd", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "EmBe Aquatics", chain: "Independent", city: "Sioux Falls", state: "SD", website: "https://www.embe.org/program/swim-lessons/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "TN": [
    { name: "Goldfish Swim School - Franklin", chain: "Goldfish Swim School", city: "Franklin", state: "TN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Germantown", chain: "Goldfish Swim School", city: "Germantown", state: "TN", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Chattanooga", chain: "Aqua-Tots", city: "Chattanooga", state: "TN", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "TX": [
    { name: "British Swim School of Houston", chain: "British Swim School", city: "Houston", state: "TX", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of McKinney", chain: "British Swim School", city: "McKinney", state: "TX", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of San Antonio", chain: "British Swim School", city: "San Antonio", state: "TX", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Austin", chain: "Goldfish Swim School", city: "Austin", state: "TX", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Carrollton", chain: "Goldfish Swim School", city: "Carrollton", state: "TX", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Houston", chain: "Goldfish Swim School", city: "Houston", state: "TX", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Katy", chain: "Goldfish Swim School", city: "Katy", state: "TX", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - San Antonio", chain: "Goldfish Swim School", city: "San Antonio", state: "TX", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Sugar Land", chain: "Goldfish Swim School", city: "Sugar Land", state: "TX", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Cedar Park", chain: "Aqua-Tots", city: "Cedar Park", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Coppell", chain: "Aqua-Tots", city: "Coppell", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Flower Mound", chain: "Aqua-Tots", city: "Flower Mound", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Fort Worth", chain: "Aqua-Tots", city: "Fort Worth", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Frisco", chain: "Aqua-Tots", city: "Frisco", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Houston", chain: "Aqua-Tots", city: "Houston", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Katy", chain: "Aqua-Tots", city: "Katy", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - McKinney", chain: "Aqua-Tots", city: "McKinney", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Plano", chain: "Aqua-Tots", city: "Plano", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Round Rock", chain: "Aqua-Tots", city: "Round Rock", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - San Antonio", chain: "Aqua-Tots", city: "San Antonio", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - The Woodlands", chain: "Aqua-Tots", city: "The Woodlands", state: "TX", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Arlington", chain: "SafeSplash", city: "Arlington", state: "TX", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Frisco", chain: "SafeSplash", city: "Frisco", state: "TX", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "SafeSplash - Houston", chain: "SafeSplash", city: "Houston", state: "TX", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Allen", chain: "Emler Swim School", city: "Allen", state: "TX", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Austin", chain: "Emler Swim School", city: "Austin", state: "TX", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Cedar Park", chain: "Emler Swim School", city: "Cedar Park", state: "TX", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Dallas", chain: "Emler Swim School", city: "Dallas", state: "TX", website: "https://emlerswimschool.com/locations/texas/dallas-walnut-hill/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Flower Mound", chain: "Emler Swim School", city: "Flower Mound", state: "TX", website: "https://emlerswimschool.com/locations/texas/flower-mound/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Fort Worth", chain: "Emler Swim School", city: "Fort Worth", state: "TX", website: "https://emlerswimschool.com/locations/texas/fort-worth/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Frisco", chain: "Emler Swim School", city: "Frisco", state: "TX", website: "https://emlerswimschool.com/locations/texas/frisco/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Houston", chain: "Emler Swim School", city: "Houston", state: "TX", website: "https://emlerswimschool.com/locations/texas/houston-meyerland/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Katy", chain: "Emler Swim School", city: "Katy", state: "TX", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Plano", chain: "Emler Swim School", city: "Plano", state: "TX", website: "https://emlerswimschool.com/locations/texas/plano/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Round Rock", chain: "Emler Swim School", city: "Round Rock", state: "TX", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - San Antonio", chain: "Emler Swim School", city: "San Antonio", state: "TX", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Southlake", chain: "Emler Swim School", city: "Southlake", state: "TX", website: "https://emlerswimschool.com/locations/texas/southlake/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SwimJim - Houston", chain: "SwimJim", city: "Houston", state: "TX", website: "https://www.swimjim.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "UT": [
    { name: "Goldfish Swim School - South Jordan", chain: "Goldfish Swim School", city: "South Jordan", state: "UT", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - West Jordan", chain: "Aqua-Tots", city: "West Jordan", state: "UT", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Holladay", chain: "Emler Swim School", city: "Holladay", state: "UT", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Pleasant Grove", chain: "Emler Swim School", city: "Pleasant Grove", state: "UT", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Salt Lake City", chain: "Emler Swim School", city: "Salt Lake City", state: "UT", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "VT": [
    { name: "Lake Dragon Aquatics", chain: "Independent", city: "Burlington", state: "VT", website: "https://lakedragonaquatics.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Ripple Swim School", chain: "Independent", city: "Burlington", state: "VT", website: "https://www.rippleswimvt.com", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Vermont Swim School - UVM", chain: "Independent", city: "Burlington", state: "VT", website: "https://uvmcampusrec.com/sports/vermont-swim-school", programs: ["toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "VA": [
    { name: "British Swim School of Alexandria", chain: "British Swim School", city: "Alexandria", state: "VA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Roanoke", chain: "British Swim School", city: "Roanoke", state: "VA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Alexandria", chain: "Goldfish Swim School", city: "Alexandria", state: "VA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Ashburn", chain: "Goldfish Swim School", city: "Ashburn", state: "VA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Falls Church", chain: "Goldfish Swim School", city: "Falls Church", state: "VA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Lake Ridge", chain: "Goldfish Swim School", city: "Lake Ridge", state: "VA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Reston", chain: "Goldfish Swim School", city: "Reston", state: "VA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Richmond", chain: "Goldfish Swim School", city: "Richmond", state: "VA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Centreville", chain: "Aqua-Tots", city: "Centreville", state: "VA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Chantilly", chain: "Aqua-Tots", city: "Chantilly", state: "VA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Leesburg", chain: "Aqua-Tots", city: "Leesburg", state: "VA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Midlothian", chain: "Aqua-Tots", city: "Midlothian", state: "VA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - Richmond", chain: "Aqua-Tots", city: "Richmond", state: "VA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Aqua-Tots - South Riding", chain: "Aqua-Tots", city: "South Riding", state: "VA", website: "https://www.aqua-tots.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Chantilly", chain: "Big Blue Swim School", city: "Chantilly", state: "VA", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Fairfax", chain: "Big Blue Swim School", city: "Fairfax", state: "VA", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Big Blue Swim School - Falls Church", chain: "Big Blue Swim School", city: "Falls Church", state: "VA", website: "https://bigblueswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Forest", chain: "Emler Swim School", city: "Forest", state: "VA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Gainesville", chain: "Emler Swim School", city: "Gainesville", state: "VA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Leesburg", chain: "Emler Swim School", city: "Leesburg", state: "VA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Woodbridge", chain: "Emler Swim School", city: "Woodbridge", state: "VA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "WA": [
    { name: "British Swim School of Seattle", chain: "British Swim School", city: "Seattle", state: "WA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "British Swim School of Vancouver", chain: "British Swim School", city: "Vancouver", state: "WA", website: "https://britishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Mill Creek", chain: "Goldfish Swim School", city: "Mill Creek", state: "WA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Puyallup", chain: "Goldfish Swim School", city: "Puyallup", state: "WA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Redmond", chain: "Goldfish Swim School", city: "Redmond", state: "WA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Shoreline", chain: "Goldfish Swim School", city: "Shoreline", state: "WA", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "SafeSplash - Bellevue", chain: "SafeSplash", city: "Bellevue", state: "WA", website: "https://www.safesplash.com/", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Olympia", chain: "Emler Swim School", city: "Olympia", state: "WA", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "WV": [
    { name: "Charleston Swim School", chain: "Independent", city: "Charleston", state: "WV", website: "https://charlestonswimlessons.com/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true },
    { name: "YMCA of Kanawha Valley", chain: "YMCA", city: "Charleston", state: "WV", website: "https://www.ymcaofkv.org/aquatics-1", programs: ["toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ],
  "WI": [
    { name: "Goldfish Swim School - Brookfield", chain: "Goldfish Swim School", city: "Brookfield", state: "WI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Fitchburg", chain: "Goldfish Swim School", city: "Fitchburg", state: "WI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Goldfish Swim School - Milwaukee", chain: "Goldfish Swim School", city: "Milwaukee", state: "WI", website: "https://goldfishswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Fitchburg", chain: "Emler Swim School", city: "Fitchburg", state: "WI", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Emler Swim School - Madison", chain: "Emler Swim School", city: "Madison", state: "WI", website: "https://emlerswimschool.com/", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Swimtastic - Menasha", chain: "Swimtastic", city: "Menasha", state: "WI", website: "https://www.swimtastic.com/locations/fox-cities-wi", programs: ["infant", "toddler", "preschool", "school-age"], indoor: true, yearRound: true }
  ],
  "WY": [
    { name: "CASC Swim Lessons", chain: "Independent", city: "Casper", state: "WY", website: "https://www.cascswimlessons.com/", programs: ["preschool", "school-age"], indoor: true, yearRound: true },
    { name: "Casper YMCA Swim Lessons", chain: "YMCA", city: "Casper", state: "WY", website: "https://casperymca.org/aquatics/", programs: ["infant", "toddler", "preschool", "school-age", "adult"], indoor: true, yearRound: true }
  ]
};
