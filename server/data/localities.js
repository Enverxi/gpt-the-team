/**
 * Target Cities & Neighboring Localities Knowledge Base
 * Specifically covers:
 * - Hyderabad
 * - Guntur (NehruNagar, Vidhyanagar, Lakshmipuram, Amaravati Road, etc.)
 * - Mangalore
 * - Srinagar (K&J / J&K)
 * - Andaman and Nicobar
 * - Gandhinagar
 */

export const TARGET_CITIES = {
  guntur: {
    city: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    countryCode: 'IN',
    center: { lat: 16.3067, lon: 80.4365 },
    localities: [
      { name: 'Nehru Nagar', aliases: ['nehrunagar', 'nehru nagar', 'nehru-nagar'], lat: 16.3120, lon: 80.4430, note: 'Central residential and commercial area in Guntur' },
      { name: 'Vidhyanagar', aliases: ['vidhyanagar', 'vidhya nagar', 'vidyanagar', 'vidya nagar'], lat: 16.3180, lon: 80.4280, note: 'Key educational and residential hub near Ring Road' },
      { name: 'Lakshmipuram', aliases: ['lakshmipuram', 'laxmipuram', 'lakshmi puram', 'laxmi puram'], lat: 16.3150, lon: 80.4380, note: 'Prime commercial and medical sector in Guntur' },
      { name: 'Amaravati Road', aliases: ['amaravati road', 'amaravathi road', 'amaravati rd', 'amaravathi rd', 'amaravati'], lat: 16.3250, lon: 80.4150, note: 'Major arterial corridor connecting Guntur to Amaravati capital region' },
      { name: 'Brodipet', aliases: ['brodipet', 'brodiepet', 'brodi pet'], lat: 16.3080, lon: 80.4460, note: 'Bustling commercial shopping, retail and dining district' },
      { name: 'Arundelpet', aliases: ['arundelpet', 'arundalpet', 'arundel pet'], lat: 16.3020, lon: 80.4480, note: 'Major commercial and business center near railway station' },
      { name: 'Pattabhipuram', aliases: ['pattabhipuram', 'pattabhi puram'], lat: 16.3160, lon: 80.4320, note: 'Established central residential neighborhood' },
      { name: 'Koretipadu', aliases: ['koretipadu', 'koritepadu'], lat: 16.3210, lon: 80.4390, note: 'Prominent residential locality in North Guntur' },
      { name: 'Syamala Nagar', aliases: ['syamala nagar', 'shyamala nagar', 'syamalanagar'], lat: 16.3040, lon: 80.4290, note: 'Quiet residential neighborhood' },
      { name: 'Gujjanagundla', aliases: ['gujjanagundla', 'gujjannagundla'], lat: 16.3190, lon: 80.4210, note: 'Fast-growing residential zone near Inner Ring Road' },
      { name: 'Old Guntur', aliases: ['old guntur', 'oldguntur'], lat: 16.2940, lon: 80.4610, note: 'Historic eastern commercial hub and agricultural trading center' },
      { name: 'Brindavan Gardens', aliases: ['brindavan gardens', 'brindavan garden'], lat: 16.3170, lon: 80.4340, note: 'Upscale residential neighborhood' },
      { name: 'Gorantla', aliases: ['gorantla'], lat: 16.3420, lon: 80.4490, note: 'Northern residential extension and educational belt of Guntur' },
      { name: 'Nallapadu', aliases: ['nallapadu'], lat: 16.2890, lon: 80.3950, note: 'Industrial and suburban belt in South-West Guntur' },
      { name: 'Perecherla', aliases: ['perecherla'], lat: 16.3280, lon: 80.3270, note: 'Junction town and neighboring suburb on Guntur-Narasaraopet highway' },
      { name: 'Mangalagiri', aliases: ['mangalagiri'], lat: 16.4320, lon: 80.5550, note: 'Historic temple town and AIIMS corridor between Guntur & Vijayawada' },
      { name: 'Pedakakani', aliases: ['pedakakani', 'peda kakani'], lat: 16.3410, lon: 80.5050, note: 'Northeastern suburb on the Chennai-Kolkata highway' },
      { name: 'Tadikonda', aliases: ['tadikonda'], lat: 16.4250, lon: 80.4520, note: 'Suburban agricultural and educational hub north of Guntur' }
    ]
  },

  hyderabad: {
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    countryCode: 'IN',
    center: { lat: 17.3850, lon: 78.4867 },
    localities: [
      { name: 'Banjara Hills', aliases: ['banjara hills', 'banjarahills'], lat: 17.4156, lon: 78.4350, note: 'Premier upscale commercial and residential neighborhood' },
      { name: 'Jubilee Hills', aliases: ['jubilee hills', 'jubileehills'], lat: 17.4319, lon: 78.4073, note: 'Affluent residential and media hub' },
      { name: 'Gachibowli', aliases: ['gachibowli'], lat: 17.4401, lon: 78.3489, note: 'Major IT hub and financial district corridor' },
      { name: 'Madhapur', aliases: ['madhapur'], lat: 17.4483, lon: 78.3915, note: 'Epicenter of IT/ITES industry in Hitech City' },
      { name: 'Hitech City', aliases: ['hitech city', 'hitex', 'cyberabad'], lat: 17.4435, lon: 78.3772, note: 'Cyberabad technology and software center' },
      { name: 'Kondapur', aliases: ['kondapur'], lat: 17.4699, lon: 78.3578, note: 'Rapidly growing IT residential corridor near botanical gardens' },
      { name: 'Kukatpally', aliases: ['kukatpally', 'kphb'], lat: 17.4948, lon: 78.3996, note: 'Major commercial and residential township in northwest Hyderabad' },
      { name: 'Begumpet', aliases: ['begumpet'], lat: 17.4447, lon: 78.4664, note: 'Key commercial zone and historic airport area' },
      { name: 'Secunderabad', aliases: ['secunderabad'], lat: 17.4399, lon: 78.4983, note: 'Twin city, military cantonment, and major railway transit junction' },
      { name: 'Charminar', aliases: ['charminar', 'old city hyderabad', 'old city'], lat: 17.3616, lon: 78.4747, note: 'Historic Old City cultural and tourist landmark' },
      { name: 'Ameerpet', aliases: ['ameerpet'], lat: 17.4375, lon: 78.4483, note: 'Major commercial and educational coaching hub' },
      { name: 'Dilsukhnagar', aliases: ['dilsukhnagar'], lat: 17.3688, lon: 78.5247, note: 'Major eastern commercial trading and retail zone' },
      { name: 'LB Nagar', aliases: ['lb nagar', 'l.b. nagar', 'l b nagar'], lat: 17.3457, lon: 78.5522, note: 'South-Eastern transit and residential gateway' },
      { name: 'Miyapur', aliases: ['miyapur'], lat: 17.4968, lon: 78.3546, note: 'North-Western metro terminal and residential hub' },
      { name: 'Manikonda', aliases: ['manikonda'], lat: 17.3995, lon: 78.3845, note: 'Popular residential zone near financial district' },
      { name: 'Financial District', aliases: ['financial district', 'nanakramguda'], lat: 17.4150, lon: 78.3420, note: 'High-rise corporate banking and software skyscraper zone' },
      { name: 'Mehdipatnam', aliases: ['mehdipatnam'], lat: 17.3916, lon: 78.4398, note: 'Central transit hub connecting airport road and old city' },
      { name: 'Somajiguda', aliases: ['somajiguda'], lat: 17.4260, lon: 78.4570, note: 'Commercial and administrative district near Raj Bhavan' },
      { name: 'Uppal', aliases: ['uppal'], lat: 17.4020, lon: 78.5600, note: 'Eastern tech suburb and cricket stadium hub' },
      { name: 'Tarnaka', aliases: ['tarnaka'], lat: 17.4280, lon: 78.5310, note: 'Academic and research center near Osmania University' }
    ]
  },

  mangalore: {
    city: 'Mangalore',
    state: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    center: { lat: 12.9141, lon: 74.8560 },
    localities: [
      { name: 'Hampankatta', aliases: ['hampankatta'], lat: 12.8698, lon: 74.8430, note: 'Historic central heart and main retail district' },
      { name: 'Kadri', aliases: ['kadri'], lat: 12.8833, lon: 74.8667, note: 'Scenic neighborhood famous for Kadri Manjunath temple and park' },
      { name: 'Bejai', aliases: ['bejai'], lat: 12.8872, lon: 74.8475, note: 'Central commercial hub and KSRTC bus terminal area' },
      { name: 'Urwa', aliases: ['urwa'], lat: 12.8944, lon: 74.8333, note: 'Coastal residential locality near Sultan Battery and Gurupura river' },
      { name: 'Pandeshwar', aliases: ['pandeshwar'], lat: 12.8580, lon: 74.8420, note: 'Commercial district near Forum Fiza Mall' },
      { name: 'Bunder', aliases: ['bunder', 'old port mangalore'], lat: 12.8620, lon: 74.8380, note: 'Historic Old Port, fish market and spice trade center' },
      { name: 'Kankanady', aliases: ['kankanady'], lat: 12.8660, lon: 74.8620, note: 'Major medical, healthcare and transit hub' },
      { name: 'Falnir', aliases: ['falnir'], lat: 12.8640, lon: 74.8510, note: 'Upscale residential neighborhood' },
      { name: 'Surathkal', aliases: ['surathkal'], lat: 13.0080, lon: 74.7940, note: 'Northern coastal town, NITK campus, lighthouse and beach' },
      { name: 'Panambur', aliases: ['panambur'], lat: 12.9520, lon: 74.8080, note: 'New Mangalore Port and famous Panambur Beach' },
      { name: 'Ullal', aliases: ['ullal'], lat: 12.8060, lon: 74.8520, note: 'Southern coastal estuary town with prominent beaches' },
      { name: 'Derebail', aliases: ['derebail'], lat: 12.9080, lon: 74.8490, note: 'Elevated residential area in northern Mangalore' },
      { name: 'Kottara', aliases: ['kottara', 'kottara chowki'], lat: 12.9020, lon: 74.8380, note: 'Key transit intersection connecting highway and coast' },
      { name: 'Kavoor', aliases: ['kavoor'], lat: 12.9230, lon: 74.8680, note: 'Suburban area on the route to Mangalore International Airport' },
      { name: 'Baikampady', aliases: ['baikampady'], lat: 12.9730, lon: 74.8140, note: 'Major industrial estate near New Mangalore Port' }
    ]
  },

  srinagar: {
    city: 'Srinagar',
    state: 'Jammu and Kashmir',
    country: 'India',
    countryCode: 'IN',
    center: { lat: 34.0837, lon: 74.7973 },
    localities: [
      { name: 'Lal Chowk', aliases: ['lal chowk', 'lalchowk'], lat: 34.0725, lon: 74.8115, note: 'Central civic square, Clock Tower (Ghanta Ghar) and historic trading center' },
      { name: 'Dal Gate', aliases: ['dal gate', 'dalgate', 'dal lake'], lat: 34.0870, lon: 74.8340, note: 'Gateway to Dal Lake, Shikara ghats and tourism epicenter' },
      { name: 'Rajbagh', aliases: ['rajbagh'], lat: 34.0670, lon: 74.8210, note: 'High-end residential area along Jhelum River' },
      { name: 'Hazratbal', aliases: ['hazratbal'], lat: 34.1260, lon: 74.8420, note: 'Historic shrine quarter on north shore of Dal Lake' },
      { name: 'Nishat', aliases: ['nishat'], lat: 34.1220, lon: 74.8810, note: 'Famed Mughal garden belt on eastern Dal Lake foothills' },
      { name: 'Shalimar', aliases: ['shalimar'], lat: 34.1480, lon: 74.8730, note: 'Iconic Mughal pleasure gardens and Zabarwan mountain backdrop' },
      { name: 'Batamaloo', aliases: ['batamaloo'], lat: 34.0740, lon: 74.7930, note: 'Bustling transport and wholesale commercial junction' },
      { name: 'Soura', aliases: ['soura'], lat: 34.1370, lon: 74.8090, note: 'Medical institute quarter (SKIMS) in northern Srinagar' },
      { name: 'Nowhatta', aliases: ['nowhatta'], lat: 34.0950, lon: 74.8160, note: 'Historic Old Downtown quarter surrounding Jamia Masjid' },
      { name: 'Karan Nagar', aliases: ['karan nagar'], lat: 34.0850, lon: 74.8020, note: 'Major healthcare and commercial district near SMHS Hospital' },
      { name: 'Boulevard Road', aliases: ['boulevard road', 'boulevard'], lat: 34.0910, lon: 74.8450, note: 'Famous lakeside promenade overlooking Dal Lake' },
      { name: 'Jawahar Nagar', aliases: ['jawahar nagar'], lat: 34.0610, lon: 74.8190, note: 'Established residential colony near flood spill channel' },
      { name: 'Bemina', aliases: ['bemina'], lat: 34.0880, lon: 74.7650, note: 'Sprawling western residential plains and institutional area' },
      { name: 'Harwan', aliases: ['harwan'], lat: 34.1610, lon: 74.8980, note: 'Ancient Buddhist site and gateway to Dachigam National Park' },
      { name: 'Zabarwan', aliases: ['zabarwan', 'zabarwan hills'], lat: 34.0950, lon: 74.8750, note: 'Scenic mountain range overlooking Dal Lake and Tulip Garden' }
    ]
  },

  andaman: {
    city: 'Andaman and Nicobar',
    state: 'Andaman and Nicobar Islands',
    country: 'India',
    countryCode: 'IN',
    center: { lat: 11.6234, lon: 92.7265 },
    localities: [
      { name: 'Port Blair', aliases: ['port blair', 'portblair'], lat: 11.6234, lon: 92.7265, note: 'Capital city and central island gateway' },
      { name: 'Aberdeen Bazaar', aliases: ['aberdeen bazaar', 'aberdeen'], lat: 11.6660, lon: 92.7420, note: 'Vibrant commercial shopping center and clock tower in Port Blair' },
      { name: 'Dollygunj', aliases: ['dollygunj'], lat: 11.6310, lon: 92.7150, note: 'Commercial and airport warehouse neighborhood' },
      { name: 'Garacharma', aliases: ['garacharma'], lat: 11.6140, lon: 92.7090, note: 'Dense residential and market locality in South Andaman' },
      { name: 'Havelock Island (Swaraj Dweep)', aliases: ['havelock', 'havelock island', 'swaraj dweep'], lat: 11.9761, lon: 92.9876, note: 'World-renowned tropical beach destination (Radhanagar Beach)' },
      { name: 'Neil Island (Shaheed Dweep)', aliases: ['neil island', 'shaheed dweep'], lat: 11.8333, lon: 93.0500, note: 'Tranquil eco-tourism island known for corals, caves and sunsets' },
      { name: 'Ross Island', aliases: ['ross island', 'netaji subhash chandra bose island'], lat: 11.6730, lon: 92.7620, note: 'Historic British colonial capital island across Port Blair harbour' },
      { name: 'Chatham Island', aliases: ['chatham'], lat: 11.6840, lon: 92.7220, note: 'Historic timber mill island connected via bridge' },
      { name: 'Phoenix Bay', aliases: ['phoenix bay'], lat: 11.6710, lon: 92.7350, note: 'Major ferry jetty connecting to inter-island services' },
      { name: 'Diglipur', aliases: ['diglipur'], lat: 13.2667, lon: 92.9667, note: 'Northern Andaman eco-tourism hub with Saddle Peak and twin islands' },
      { name: 'Baratang', aliases: ['baratang'], lat: 12.1150, lon: 92.7560, note: 'Middle Andaman island famous for limestone caves and mud volcanoes' },
      { name: 'Wandoor', aliases: ['wandoor'], lat: 11.6050, lon: 92.6180, note: 'Coastal gateway to Mahatma Gandhi Marine National Park' },
      { name: 'Chidiyatapu', aliases: ['chidiyatapu', 'chidiya tapu'], lat: 11.4980, lon: 92.7050, note: 'Southernmost tip of South Andaman renowned for birdwatching and sunsets' }
    ]
  },

  gandhinagar: {
    city: 'Gandhinagar',
    state: 'Gujarat',
    country: 'India',
    countryCode: 'IN',
    center: { lat: 23.2156, lon: 72.6369 },
    localities: [
      { name: 'Infocity', aliases: ['infocity'], lat: 23.1890, lon: 72.6280, note: 'Premier IT park and software technology center' },
      { name: 'Kudasan', aliases: ['kudasan'], lat: 23.1770, lon: 72.6360, note: 'High-density modern residential and dining corridor' },
      { name: 'Raysan', aliases: ['raysan', 'raisan'], lat: 23.1640, lon: 72.6480, note: 'Educational hub near PDEU/PDPU and Sabarmati riverfront' },
      { name: 'Sargasan', aliases: ['sargasan'], lat: 23.1850, lon: 72.6070, note: 'Fast-developing residential and commercial zone on SG Highway corridor' },
      { name: 'GIFT City', aliases: ['gift city', 'gift'], lat: 23.1590, lon: 72.6840, note: 'Global Financial and Technological Smart City' },
      { name: 'Sector 21', aliases: ['sector 21'], lat: 23.2270, lon: 72.6510, note: 'Prime commercial and market sector in central Gandhinagar' },
      { name: 'Sector 1 to Sector 30', aliases: ['sectors', 'sector 1', 'sector 10', 'sector 11', 'sector 28'], lat: 23.2156, lon: 72.6369, note: 'Signature grid sectors of Gandhinagar planned capital' },
      { name: 'Koba', aliases: ['koba'], lat: 23.1460, lon: 72.6420, note: 'Gateway junction linking Gandhinagar to Ahmedabad international airport' },
      { name: 'Vavol', aliases: ['vavol'], lat: 23.2090, lon: 72.6080, note: 'Western residential suburb near railway corridor' },
      { name: 'Pethapur', aliases: ['pethapur'], lat: 23.2570, lon: 72.6470, note: 'Historic northern suburb known for traditional wooden block printing' },
      { name: 'Chiloda', aliases: ['chiloda'], lat: 23.2380, lon: 72.7120, note: 'Eastern highway crossroad towards North Gujarat' },
      { name: 'Randheja', aliases: ['randheja'], lat: 23.3080, lon: 72.6250, note: 'Northern educational and suburban belt' }
    ]
  }
};

/**
 * Search the target localities directory
 */
export function findLocalities(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return [];
  const qClean = query.trim().toLowerCase().replace(/[\s\-_]+/g, '');
  const matches = [];

  for (const cityKey of Object.keys(TARGET_CITIES)) {
    const cityData = TARGET_CITIES[cityKey];

    // Check if query matches the city name itself
    const cityNameClean = cityData.city.toLowerCase().replace(/[\s\-_]+/g, '');
    if (cityNameClean.includes(qClean) || qClean.includes(cityNameClean)) {
      matches.push({
        name: cityData.city,
        region: cityData.state,
        country: cityData.country,
        countryCode: cityData.countryCode,
        lat: cityData.center.lat,
        lon: cityData.center.lon,
        displayName: `${cityData.city}, ${cityData.state}, ${cityData.country}`,
        isCityCenter: true,
        parentCity: cityData.city
      });
    }

    // Check localities
    for (const loc of cityData.localities) {
      const isMatch = loc.aliases.some(alias => {
        const aClean = alias.replace(/[\s\-_]+/g, '');
        return aClean.includes(qClean) || qClean.includes(aClean);
      });

      if (isMatch) {
        matches.push({
          name: `${loc.name}, ${cityData.city}`,
          region: cityData.state,
          country: cityData.country,
          countryCode: cityData.countryCode,
          lat: loc.lat,
          lon: loc.lon,
          displayName: `${loc.name}, ${cityData.city}, ${cityData.state}`,
          parentCity: cityData.city,
          localityName: loc.name,
          note: loc.note
        });
      }
    }
  }

  return matches;
}

/**
 * Detect if a conversational prompt mentions any specific locality or target city
 */
export function detectMentionedLocality(text) {
  if (!text || typeof text !== 'string') return null;
  const normalizedText = text.toLowerCase();
  const normalizedNoSpaces = normalizedText.replace(/[^a-z0-9]/g, '');

  let bestMatch = null;
  let maxMatchLength = 0;

  for (const cityKey of Object.keys(TARGET_CITIES)) {
    const cityData = TARGET_CITIES[cityKey];

    for (const loc of cityData.localities) {
      for (const alias of loc.aliases) {
        const aliasClean = alias.toLowerCase();
        const aliasNoSpaces = aliasClean.replace(/[^a-z0-9]/g, '');

        // Word boundary match or contiguous string match
        const regex = new RegExp(`\\b${aliasClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const matched = regex.test(normalizedText) || (aliasNoSpaces.length >= 5 && normalizedNoSpaces.includes(aliasNoSpaces));

        if (matched && aliasClean.length > maxMatchLength) {
          maxMatchLength = aliasClean.length;
          bestMatch = {
            name: loc.name,
            parentCity: cityData.city,
            state: cityData.state,
            country: cityData.country,
            countryCode: cityData.countryCode,
            lat: loc.lat,
            lon: loc.lon,
            note: loc.note,
            displayName: `${loc.name}, ${cityData.city}`
          };
        }
      }
    }
  }

  // Also check if the parent city name itself was explicitly mentioned if no specific locality matched
  if (!bestMatch) {
    for (const cityKey of Object.keys(TARGET_CITIES)) {
      const cityData = TARGET_CITIES[cityKey];
      const cityName = cityData.city.toLowerCase();
      if (new RegExp(`\\b${cityName}\\b`, 'i').test(normalizedText)) {
        bestMatch = {
          name: cityData.city,
          parentCity: cityData.city,
          state: cityData.state,
          country: cityData.country,
          countryCode: cityData.countryCode,
          lat: cityData.center.lat,
          lon: cityData.center.lon,
          note: `Capital/hub city of ${cityData.state}`,
          displayName: `${cityData.city}, ${cityData.state}`
        };
        break;
      }
    }
  }

  return bestMatch;
}
