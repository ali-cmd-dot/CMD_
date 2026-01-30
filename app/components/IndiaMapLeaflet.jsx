'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { Maximize2, Minimize2, MapPin, Activity, TrendingUp, Zap, AlertCircle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export default function IndiaMapLeaflet({ installationTrackerData }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isFullscreen])

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl">
        <div className="text-center space-y-4">
          <div className="loading-spinner-clean"></div>
          <div className="text-gray-700 text-lg font-medium">Loading Network Map...</div>
        </div>
      </div>
    )
  }

  if (!installationTrackerData || !installationTrackerData.cityCount) {
    return (
      <div className="text-center py-20 text-gray-600">
        <Activity className="mx-auto mb-4" size={48} />
        <p>Loading device data...</p>
      </div>
    )
  }

  // COMPREHENSIVE city coordinates - covers ALL major Indian cities
  const cityCoordinates = {
    // Major metros
    'mumbai': { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
    'delhi': { lat: 28.7041, lng: 77.1025, label: 'Delhi' },
    'bengaluru': { lat: 12.9716, lng: 77.5946, label: 'Bengaluru' },
    'bangalore': { lat: 12.9716, lng: 77.5946, label: 'Bangalore' },
    'kolkata': { lat: 22.5726, lng: 88.3639, label: 'Kolkata' },
    'chennai': { lat: 13.0827, lng: 80.2707, label: 'Chennai' },
    'hyderabad': { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' },
    'pune': { lat: 18.5204, lng: 73.8567, label: 'Pune' },
    'ahmedabad': { lat: 23.0225, lng: 72.5714, label: 'Ahmedabad' },
    
    // All Tier 1 & 2 cities
    'surat': { lat: 21.1702, lng: 72.8311, label: 'Surat' },
    'jaipur': { lat: 26.9124, lng: 75.7873, label: 'Jaipur' },
    'lucknow': { lat: 26.8467, lng: 80.9462, label: 'Lucknow' },
    'kanpur': { lat: 26.4499, lng: 80.3319, label: 'Kanpur' },
    'nagpur': { lat: 21.1458, lng: 79.0882, label: 'Nagpur' },
    'indore': { lat: 22.7196, lng: 75.8577, label: 'Indore' },
    'thane': { lat: 19.2183, lng: 72.9781, label: 'Thane' },
    'bhopal': { lat: 23.2599, lng: 77.4126, label: 'Bhopal' },
    'visakhapatnam': { lat: 17.6869, lng: 83.2185, label: 'Visakhapatnam' },
    'vizag': { lat: 17.6869, lng: 83.2185, label: 'Vizag' },
    'patna': { lat: 25.5941, lng: 85.1376, label: 'Patna' },
    'vadodara': { lat: 22.3072, lng: 73.1812, label: 'Vadodara' },
    'baroda': { lat: 22.3072, lng: 73.1812, label: 'Baroda' },
    'ghaziabad': { lat: 28.6692, lng: 77.4538, label: 'Ghaziabad' },
    'ludhiana': { lat: 30.9010, lng: 75.8573, label: 'Ludhiana' },
    'agra': { lat: 27.1767, lng: 78.0081, label: 'Agra' },
    'nashik': { lat: 19.9975, lng: 73.7898, label: 'Nashik' },
    'faridabad': { lat: 28.4089, lng: 77.3178, label: 'Faridabad' },
    'meerut': { lat: 28.9845, lng: 77.7064, label: 'Meerut' },
    'rajkot': { lat: 22.3039, lng: 70.8022, label: 'Rajkot' },
    'varanasi': { lat: 25.3176, lng: 82.9739, label: 'Varanasi' },
    'banaras': { lat: 25.3176, lng: 82.9739, label: 'Banaras' },
    'kashi': { lat: 25.3176, lng: 82.9739, label: 'Kashi' },
    'srinagar': { lat: 34.0837, lng: 74.7973, label: 'Srinagar' },
    'aurangabad': { lat: 19.8762, lng: 75.3433, label: 'Aurangabad' },
    'dhanbad': { lat: 23.7957, lng: 86.4304, label: 'Dhanbad' },
    'amritsar': { lat: 31.6340, lng: 74.8723, label: 'Amritsar' },
    'navi mumbai': { lat: 19.0330, lng: 73.0297, label: 'Navi Mumbai' },
    'allahabad': { lat: 25.4358, lng: 81.8463, label: 'Allahabad' },
    'prayagraj': { lat: 25.4358, lng: 81.8463, label: 'Prayagraj' },
    'ranchi': { lat: 23.3441, lng: 85.3096, label: 'Ranchi' },
    'howrah': { lat: 22.5958, lng: 88.2636, label: 'Howrah' },
    'coimbatore': { lat: 11.0168, lng: 76.9558, label: 'Coimbatore' },
    'jabalpur': { lat: 23.1815, lng: 79.9864, label: 'Jabalpur' },
    'gwalior': { lat: 26.2183, lng: 78.1828, label: 'Gwalior' },
    'vijayawada': { lat: 16.5062, lng: 80.6480, label: 'Vijayawada' },
    'jodhpur': { lat: 26.2389, lng: 73.0243, label: 'Jodhpur' },
    'madurai': { lat: 9.9252, lng: 78.1198, label: 'Madurai' },
    'raipur': { lat: 21.2514, lng: 81.6296, label: 'Raipur' },
    'kota': { lat: 25.2138, lng: 75.8648, label: 'Kota' },
    'chandigarh': { lat: 30.7333, lng: 76.7794, label: 'Chandigarh' },
    'guwahati': { lat: 26.1445, lng: 91.7362, label: 'Guwahati' },
    'gauhati': { lat: 26.1445, lng: 91.7362, label: 'Gauhati' },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, label: 'Thiruvananthapuram' },
    'trivandrum': { lat: 8.5241, lng: 76.9366, label: 'Trivandrum' },
    'solapur': { lat: 17.6599, lng: 75.9064, label: 'Solapur' },
    'tiruchirappalli': { lat: 10.7905, lng: 78.7047, label: 'Tiruchirappalli' },
    'trichy': { lat: 10.7905, lng: 78.7047, label: 'Trichy' },
    'tiruppur': { lat: 11.1085, lng: 77.3411, label: 'Tiruppur' },
    'bareilly': { lat: 28.3670, lng: 79.4304, label: 'Bareilly' },
    'mysore': { lat: 12.2958, lng: 76.6394, label: 'Mysore' },
    'mysuru': { lat: 12.2958, lng: 76.6394, label: 'Mysuru' },
    'salem': { lat: 11.6643, lng: 78.1460, label: 'Salem' },
    'gurgaon': { lat: 28.4595, lng: 77.0266, label: 'Gurgaon' },
    'gurugram': { lat: 28.4595, lng: 77.0266, label: 'Gurugram' },
    'aligarh': { lat: 27.8974, lng: 78.0880, label: 'Aligarh' },
    'jalandhar': { lat: 31.3260, lng: 75.5762, label: 'Jalandhar' },
    'bhubaneswar': { lat: 20.2961, lng: 85.8245, label: 'Bhubaneswar' },
    'bhubaneshwar': { lat: 20.2961, lng: 85.8245, label: 'Bhubaneshwar' },
    'noida': { lat: 28.5355, lng: 77.3910, label: 'Noida' },
    'moradabad': { lat: 28.8389, lng: 78.7378, label: 'Moradabad' },
    'kochi': { lat: 9.9312, lng: 76.2673, label: 'Kochi' },
    'cochin': { lat: 9.9312, lng: 76.2673, label: 'Cochin' },
    'mangalore': { lat: 12.9141, lng: 74.8560, label: 'Mangalore' },
    'mangaluru': { lat: 12.9141, lng: 74.8560, label: 'Mangaluru' },
    'warangal': { lat: 17.9689, lng: 79.5941, label: 'Warangal' },
    'tiruvallur': { lat: 13.1433, lng: 79.9074, label: 'Tiruvallur' },
    'kalyan': { lat: 19.2403, lng: 73.1305, label: 'Kalyan' },
    'dombivli': { lat: 19.2183, lng: 73.0868, label: 'Dombivli' },
    'vasai': { lat: 19.4614, lng: 72.7875, label: 'Vasai' },
    'virar': { lat: 19.4559, lng: 72.8111, label: 'Virar' },
    'pimpri': { lat: 18.6298, lng: 73.7997, label: 'Pimpri' },
    'chinchwad': { lat: 18.6186, lng: 73.8037, label: 'Chinchwad' },
    'bikaner': { lat: 28.0229, lng: 73.3119, label: 'Bikaner' },
    'amravati': { lat: 20.9374, lng: 77.7796, label: 'Amravati' },
    'udaipur': { lat: 24.5854, lng: 73.7125, label: 'Udaipur' },
    'jamshedpur': { lat: 22.8046, lng: 86.2029, label: 'Jamshedpur' },
    'bhilai': { lat: 21.1938, lng: 81.3509, label: 'Bhilai' },
    'cuttack': { lat: 20.4625, lng: 85.8830, label: 'Cuttack' },
    'firozabad': { lat: 27.1591, lng: 78.3957, label: 'Firozabad' },
    'bhavnagar': { lat: 21.7645, lng: 72.1519, label: 'Bhavnagar' },
    'dehradun': { lat: 30.3165, lng: 78.0322, label: 'Dehradun' },
    'asansol': { lat: 23.6839, lng: 86.9524, label: 'Asansol' },
    'nanded': { lat: 19.1383, lng: 77.3210, label: 'Nanded' },
    'ajmer': { lat: 26.4499, lng: 74.6399, label: 'Ajmer' },
    'jamnagar': { lat: 22.4707, lng: 70.0577, label: 'Jamnagar' },
    'ujjain': { lat: 23.1765, lng: 75.7885, label: 'Ujjain' },
    'sangli': { lat: 16.8524, lng: 74.5815, label: 'Sangli' },
    'loni': { lat: 28.7515, lng: 77.2865, label: 'Loni' },
    'jhansi': { lat: 25.4484, lng: 78.5685, label: 'Jhansi' },
    'pondicherry': { lat: 11.9416, lng: 79.8083, label: 'Pondicherry' },
    'puducherry': { lat: 11.9416, lng: 79.8083, label: 'Puducherry' },
    'nellore': { lat: 14.4426, lng: 79.9865, label: 'Nellore' },
    'jammu': { lat: 32.7266, lng: 74.8570, label: 'Jammu' },
    'belgaum': { lat: 15.8497, lng: 74.4977, label: 'Belgaum' },
    'belagavi': { lat: 15.8497, lng: 74.4977, label: 'Belagavi' },
    'ambattur': { lat: 13.1143, lng: 80.1548, label: 'Ambattur' },
    'tirunelveli': { lat: 8.7139, lng: 77.7567, label: 'Tirunelveli' },
    'malegaon': { lat: 20.5579, lng: 74.5287, label: 'Malegaon' },
    'gaya': { lat: 24.7955, lng: 84.9994, label: 'Gaya' },
    'tirupati': { lat: 13.6288, lng: 79.4192, label: 'Tirupati' },
    'davanagere': { lat: 14.4644, lng: 75.9218, label: 'Davanagere' },
    'kozhikode': { lat: 11.2588, lng: 75.7804, label: 'Kozhikode' },
    'calicut': { lat: 11.2588, lng: 75.7804, label: 'Calicut' },
    'akola': { lat: 20.7333, lng: 77.0082, label: 'Akola' },
    'kurnool': { lat: 15.8281, lng: 78.0373, label: 'Kurnool' },
    'bokaro': { lat: 23.6693, lng: 86.1511, label: 'Bokaro' },
    'rajahmundry': { lat: 17.0005, lng: 81.8040, label: 'Rajahmundry' },
    'ballari': { lat: 15.1394, lng: 76.9214, label: 'Ballari' },
    'bellary': { lat: 15.1394, lng: 76.9214, label: 'Bellary' },
    'agartala': { lat: 23.8315, lng: 91.2868, label: 'Agartala' },
    'bhagalpur': { lat: 25.2425, lng: 86.9842, label: 'Bhagalpur' },
    'latur': { lat: 18.3996, lng: 76.5630, label: 'Latur' },
    'dhule': { lat: 20.9042, lng: 74.7749, label: 'Dhule' },
    'korba': { lat: 22.3595, lng: 82.7501, label: 'Korba' },
    'bhilwara': { lat: 25.3407, lng: 74.6269, label: 'Bhilwara' },
    'brahmapur': { lat: 19.3150, lng: 84.7941, label: 'Brahmapur' },
    'berhampur': { lat: 19.3150, lng: 84.7941, label: 'Berhampur' },
    'muzaffarpur': { lat: 26.1225, lng: 85.3906, label: 'Muzaffarpur' },
    'ahmednagar': { lat: 19.0948, lng: 74.7480, label: 'Ahmednagar' },
    'mathura': { lat: 27.4924, lng: 77.6737, label: 'Mathura' },
    'kollam': { lat: 8.8932, lng: 76.6141, label: 'Kollam' },
    'avadi': { lat: 13.1067, lng: 80.1090, label: 'Avadi' },
    'kadapa': { lat: 14.4674, lng: 78.8241, label: 'Kadapa' },
    'cuddapah': { lat: 14.4674, lng: 78.8241, label: 'Cuddapah' },
    'raichur': { lat: 16.2076, lng: 77.3463, label: 'Raichur' },
    'thoothukudi': { lat: 8.7642, lng: 78.1348, label: 'Thoothukudi' },
    'tuticorin': { lat: 8.7642, lng: 78.1348, label: 'Tuticorin' },
    'imphal': { lat: 24.8170, lng: 93.9368, label: 'Imphal' },
    'ratlam': { lat: 23.3301, lng: 75.0367, label: 'Ratlam' },
    'hapur': { lat: 28.7433, lng: 77.7764, label: 'Hapur' },
    'anantapur': { lat: 14.6819, lng: 77.6006, label: 'Anantapur' },
    'anantapuram': { lat: 14.6819, lng: 77.6006, label: 'Anantapuram' },
    'arrah': { lat: 25.5562, lng: 84.6626, label: 'Arrah' },
    'karimnagar': { lat: 18.4386, lng: 79.1288, label: 'Karimnagar' },
    'etawah': { lat: 26.7855, lng: 79.0215, label: 'Etawah' },
    'bharatpur': { lat: 27.2173, lng: 77.4900, label: 'Bharatpur' },
    'begusarai': { lat: 25.4182, lng: 86.1346, label: 'Begusarai' },
    'new delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi' },
    'chhapra': { lat: 25.7805, lng: 84.7278, label: 'Chhapra' },
    'saran': { lat: 25.7805, lng: 84.7278, label: 'Saran' },
    'ozhukarai': { lat: 11.9570, lng: 79.7737, label: 'Ozhukarai' },
    'kancheepuram': { lat: 12.8342, lng: 79.7036, label: 'Kancheepuram' },
    'patiala': { lat: 30.3398, lng: 76.3869, label: 'Patiala' },
    'rohtak': { lat: 28.8955, lng: 76.6066, label: 'Rohtak' },
    'panipat': { lat: 29.3909, lng: 76.9635, label: 'Panipat' },
    'durgapur': { lat: 23.5204, lng: 87.3119, label: 'Durgapur' },
    'siliguri': { lat: 26.7271, lng: 88.3953, label: 'Siliguri' },
    'chittoor': { lat: 13.2172, lng: 79.1003, label: 'Chittoor' },
    'tenali': { lat: 16.2428, lng: 80.6358, label: 'Tenali' },
    'machilipatnam': { lat: 16.1875, lng: 81.1389, label: 'Machilipatnam' },
    'proddatur': { lat: 14.7502, lng: 78.5481, label: 'Proddatur' },
    'adoni': { lat: 15.6281, lng: 77.2750, label: 'Adoni' },
    'hindupur': { lat: 13.8283, lng: 77.4911, label: 'Hindupur' },
    'secunderabad': { lat: 17.4399, lng: 78.4983, label: 'Secunderabad' },
    'khammam': { lat: 17.2473, lng: 80.1436, label: 'Khammam' },
    'unnao': { lat: 26.5464, lng: 80.4879, label: 'Unnao' },
    'bhimavaram': { lat: 16.5449, lng: 81.5212, label: 'Bhimavaram' },
    'hajipur': { lat: 25.6892, lng: 85.2100, label: 'Hajipur' },
    'farrukhabad': { lat: 27.3882, lng: 79.5825, label: 'Farrukhabad' },
    'shimoga': { lat: 13.9299, lng: 75.5681, label: 'Shimoga' },
    'shivamogga': { lat: 13.9299, lng: 75.5681, label: 'Shivamogga' },
    'parbhani': { lat: 19.2608, lng: 76.7611, label: 'Parbhani' },
    'kamarhati': { lat: 22.6710, lng: 88.3744, label: 'Kamarhati' },
    'bilaspur': { lat: 22.0797, lng: 82.1409, label: 'Bilaspur' },
    'shahjahanpur': { lat: 27.8801, lng: 79.9054, label: 'Shahjahanpur' },
    'satara': { lat: 17.6805, lng: 74.0183, label: 'Satara' },
    'bijapur': { lat: 16.8302, lng: 75.7100, label: 'Bijapur' },
    'vijayapura': { lat: 16.8302, lng: 75.7100, label: 'Vijayapura' },
    'ramgundam': { lat: 18.8055, lng: 79.4747, label: 'Ramgundam' },
    'ramagundam': { lat: 18.7554, lng: 79.4747, label: 'Ramagundam' },
    'shimla': { lat: 31.1048, lng: 77.1734, label: 'Shimla' },
    'chandrapur': { lat: 19.9615, lng: 79.2961, label: 'Chandrapur' },
    'junagadh': { lat: 21.5222, lng: 70.4579, label: 'Junagadh' },
    'thrissur': { lat: 10.5276, lng: 76.2144, label: 'Thrissur' },
    'trichur': { lat: 10.5276, lng: 76.2144, label: 'Trichur' },
    'alwar': { lat: 27.5530, lng: 76.6346, label: 'Alwar' },
    'kakinada': { lat: 16.9891, lng: 82.2475, label: 'Kakinada' },
    'nizamabad': { lat: 18.6725, lng: 78.0941, label: 'Nizamabad' },
    'sagar': { lat: 23.8388, lng: 78.7378, label: 'Sagar' },
    'tumkur': { lat: 13.3392, lng: 77.1006, label: 'Tumkur' },
    'tumakuru': { lat: 13.3392, lng: 77.1006, label: 'Tumakuru' },
    'hisar': { lat: 29.1492, lng: 75.7217, label: 'Hisar' },
    'hissar': { lat: 29.1492, lng: 75.7217, label: 'Hissar' },
    'panvel': { lat: 18.9894, lng: 73.1105, label: 'Panvel' },
    'darbhanga': { lat: 26.1542, lng: 85.8918, label: 'Darbhanga' },
    'kharagpur': { lat: 22.3460, lng: 87.2320, label: 'Kharagpur' },
    'aizawl': { lat: 23.7271, lng: 92.7176, label: 'Aizawl' },
    'ichalkaranji': { lat: 16.6890, lng: 74.4606, label: 'Ichalkaranji' },
    'karnal': { lat: 29.6857, lng: 76.9905, label: 'Karnal' },
    'bathinda': { lat: 30.2110, lng: 74.9455, label: 'Bathinda' },
    'shillong': { lat: 25.5788, lng: 91.8933, label: 'Shillong' },
    'sambalpur': { lat: 21.4704, lng: 83.9701, label: 'Sambalpur' },
    'ongole': { lat: 15.5057, lng: 80.0499, label: 'Ongole' },
    'deoghar': { lat: 24.4854, lng: 86.6947, label: 'Deoghar' },
    'nandyal': { lat: 15.4777, lng: 78.4836, label: 'Nandyal' },
    'morena': { lat: 26.4953, lng: 77.9956, label: 'Morena' },
    'bhiwani': { lat: 28.7830, lng: 76.1399, label: 'Bhiwani' },
    'port blair': { lat: 11.6234, lng: 92.7265, label: 'Port Blair' },
    'haridwar': { lat: 29.9457, lng: 78.1642, label: 'Haridwar' },
    'nagercoil': { lat: 8.1762, lng: 77.4347, label: 'Nagercoil' },
    'katihar': { lat: 25.5355, lng: 87.5783, label: 'Katihar' },
    'silchar': { lat: 24.8333, lng: 92.7789, label: 'Silchar' },
    'eluru': { lat: 16.7107, lng: 81.0953, label: 'Eluru' },
    'guna': { lat: 24.6504, lng: 77.3116, label: 'Guna' },
    'budaun': { lat: 28.0344, lng: 79.1140, label: 'Budaun' },
    'jalgaon': { lat: 21.0077, lng: 75.5626, label: 'Jalgaon' },
    'porbandar': { lat: 21.6417, lng: 69.6293, label: 'Porbandar' },
    'pudukottai': { lat: 10.3833, lng: 78.8000, label: 'Pudukottai' },
    'dibrugarh': { lat: 27.4728, lng: 94.9120, label: 'Dibrugarh' },
    'hosur': { lat: 12.7409, lng: 77.8253, label: 'Hosur' },
    'vellore': { lat: 12.9165, lng: 79.1325, label: 'Vellore' },
    'raiganj': { lat: 25.6140, lng: 88.1239, label: 'Raiganj' },
    'santipur': { lat: 23.2551, lng: 88.4349, label: 'Santipur' },
    'gandhidham': { lat: 23.0800, lng: 70.1300, label: 'Gandhidham' },
    'cuddalore': { lat: 11.7480, lng: 79.7714, label: 'Cuddalore' },
    'kumbakonam': { lat: 10.9617, lng: 79.3881, label: 'Kumbakonam' },
    'dindigul': { lat: 10.3673, lng: 77.9803, label: 'Dindigul' },
    'hospet': { lat: 15.2695, lng: 76.3875, label: 'Hospet' },
    'hospete': { lat: 15.2695, lng: 76.3875, label: 'Hospete' },
    'nadiad': { lat: 22.6939, lng: 72.8611, label: 'Nadiad' },
    'satna': { lat: 24.6005, lng: 80.8322, label: 'Satna' },
    'surendranagar': { lat: 22.7039, lng: 71.6378, label: 'Surendranagar' },
    'thanjavur': { lat: 10.7870, lng: 79.1378, label: 'Thanjavur' },
    'tanjore': { lat: 10.7870, lng: 79.1378, label: 'Tanjore' },
    'bulandshahr': { lat: 28.4067, lng: 77.8498, label: 'Bulandshahr' },
    'bharuch': { lat: 21.7051, lng: 72.9959, label: 'Bharuch' },
    'naihati': { lat: 22.8934, lng: 88.4196, label: 'Naihati' },
    'barasat': { lat: 22.7237, lng: 88.4820, label: 'Barasat' },
    'bally': { lat: 22.6514, lng: 88.3405, label: 'Bally' },
    'baranagar': { lat: 22.6422, lng: 88.3726, label: 'Baranagar' },
    'tiruchengode': { lat: 11.3782, lng: 77.8938, label: 'Tiruchengode' },
    'pallavaram': { lat: 12.9675, lng: 80.1491, label: 'Pallavaram' },
    'bidhannagar': { lat: 22.6240, lng: 88.4337, label: 'Bidhannagar' },
    'munger': { lat: 25.3753, lng: 86.4733, label: 'Munger' },
    'panchkula': { lat: 30.6942, lng: 76.8534, label: 'Panchkula' },
    'burhanpur': { lat: 21.3110, lng: 76.2294, label: 'Burhanpur' },
    'raurkela': { lat: 22.2497, lng: 84.8644, label: 'Raurkela' },
    'vizianagaram': { lat: 18.1067, lng: 83.4124, label: 'Vizianagaram' },
    'srikakulam': { lat: 18.2949, lng: 83.8938, label: 'Srikakulam' },
    'rewari': { lat: 28.1988, lng: 76.6194, label: 'Rewari' },
    'yamunanagar': { lat: 30.1290, lng: 77.2674, label: 'Yamunanagar' },
    'baharampur': { lat: 24.1000, lng: 88.2500, label: 'Baharampur' },
    'kulti': { lat: 23.7307, lng: 86.8454, label: 'Kulti' },
  }

  // Get ALL cities from data with their counts
  const citiesBreakdown = installationTrackerData.citiesBreakdown || []
  
  // Map cities to coordinates - IMPORTANT: Don't filter out any cities!
  const cityData = citiesBreakdown.map(cityInfo => {
    const cityKey = cityInfo.city.toLowerCase().trim()
    const coords = cityCoordinates[cityKey]
    
    if (coords) {
      return {
        ...coords,
        count: cityInfo.count,
        key: cityKey,
        hasCoordinates: true
      }
    } else {
      // For cities without coordinates, place them in a default location
      // We'll spread them around central India
      const baseAngle = (cityKey.charCodeAt(0) + cityKey.charCodeAt(Math.floor(cityKey.length/2))) * 13.7
      const radius = 5 + (cityInfo.count / 10)
      
      return {
        lat: 23.0 + Math.sin(baseAngle) * radius,
        lng: 79.0 + Math.cos(baseAngle) * radius,
        label: cityInfo.city,
        count: cityInfo.count,
        key: cityKey,
        hasCoordinates: false
      }
    }
  })

  // Separate mapped and unmapped cities for stats
  const mappedCities = cityData.filter(c => c.hasCoordinates)
  const unmappedCities = cityData.filter(c => !c.hasCoordinates)

  const totalDevices = Object.values(installationTrackerData.cityCount || {}).reduce((a, b) => a + b, 0)

  const getMarkerColor = (count) => {
    if (count > 500) return '#ef4444' // red
    if (count > 200) return '#f97316' // orange
    if (count > 100) return '#f59e0b' // amber
    if (count > 50) return '#eab308' // yellow
    return '#22c55e' // green
  }

  const getMarkerSize = (count) => {
    if (count > 500) return 24
    if (count > 200) return 20
    if (count > 100) return 16
    if (count > 50) return 13
    return 10
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  const MapView = () => (
    <div className="relative w-full h-full">
      {/* Leaflet Map with Vibrant Colorful Theme */}
      <MapContainer
        center={[22.5, 79.5]}
        zoom={5}
        style={{ height: '100%', width: '100%', background: '#e0f2fe' }}
        zoomControl={true}
        attributionControl={false}
      >
        {/* Beautiful Esri World Street Map - Colorful and vibrant */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri'
        />

        {/* City markers with counts - ALL CITIES SHOWN! */}
        {cityData.map((city, index) => (
          <CircleMarker
            key={index}
            center={[city.lat, city.lng]}
            radius={getMarkerSize(city.count)}
            pathOptions={{
              fillColor: getMarkerColor(city.count),
              fillOpacity: city.hasCoordinates ? 0.85 : 0.65,
              color: city.hasCoordinates ? '#ffffff' : '#fbbf24',
              weight: city.hasCoordinates ? 2.5 : 3,
              className: 'city-marker'
            }}
          >
            {/* Count displayed inside bubble */}
            <Tooltip permanent direction="center" className="count-tooltip" opacity={1}>
              <span className="font-bold text-white" style={{ 
                fontSize: city.count > 100 ? '11px' : '10px', 
                textShadow: '0 1px 2px rgba(0,0,0,0.8)' 
              }}>
                {city.count}
              </span>
            </Tooltip>
            <Popup>
              <div className="text-sm p-1">
                <div className="font-bold text-base mb-1 text-gray-800">
                  {city.label}
                  {!city.hasCoordinates && (
                    <span className="ml-2 text-xs text-yellow-600">📍 Approx</span>
                  )}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold text-lg text-blue-600">{city.count}</span> devices
                </div>
                {!city.hasCoordinates && (
                  <div className="text-xs text-yellow-600 mt-1">
                    Coordinates not available
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Stats Overlay - Top Left */}
      <div className={`${isFullscreen ? 'fixed top-8 left-8' : 'absolute top-6 left-6'} z-[10000] flex flex-col gap-3`}>
        <div className="map-card">
          <div className="flex items-center gap-3">
            <div className="map-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <MapPin size={20} />
            </div>
            <div>
              <div className="map-label">ALL CITIES</div>
              <div className="map-value">{cityData.length}</div>
            </div>
          </div>
        </div>
        
        <div className="map-card">
          <div className="flex items-center gap-3">
            <div className="map-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Activity size={20} />
            </div>
            <div>
              <div className="map-label">TOTAL DEVICES</div>
              <div className="map-value">{totalDevices.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="map-card">
          <div className="flex items-center gap-3">
            <div className="map-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="map-label">MAPPED</div>
              <div className="map-value">{mappedCities.length}</div>
            </div>
          </div>
        </div>

        {unmappedCities.length > 0 && (
          <div className="map-card bg-yellow-50 border-yellow-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-yellow-600" size={16} />
              <div className="text-xs font-bold text-yellow-800">
                {unmappedCities.length} cities approx. positioned
              </div>
            </div>
            <div className="text-xs text-yellow-700 max-h-24 overflow-y-auto space-y-1">
              {unmappedCities.slice(0, 5).map((c, i) => (
                <div key={i}>• {c.label} ({c.count})</div>
              ))}
              {unmappedCities.length > 5 && (
                <div className="font-semibold">...and {unmappedCities.length - 5} more</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend - Bottom Right */}
      <div className={`${isFullscreen ? 'fixed bottom-8 right-8' : 'absolute bottom-6 right-6'} z-[10000] map-card map-legend`}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-300">
          <Zap className="text-blue-600" size={22} />
          <div className="text-gray-800 font-bold text-base">Device Density</div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="legend-row">
            <div className="legend-dot pulse-marker" style={{ background: '#ef4444', boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' }}></div>
            <span className="legend-text">500+ devices</span>
            <span className="legend-badge hot">🔥 HOT</span>
          </div>
          <div className="legend-row">
            <div className="legend-dot pulse-marker" style={{ background: '#f97316', boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }}></div>
            <span className="legend-text">200-500</span>
            <span className="legend-badge active">⚡ ACTIVE</span>
          </div>
          <div className="legend-row">
            <div className="legend-dot pulse-marker" style={{ background: '#f59e0b', boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}></div>
            <span className="legend-text">100-200</span>
            <span className="legend-badge growing">✨ GROWING</span>
          </div>
          <div className="legend-row">
            <div className="legend-dot pulse-marker" style={{ background: '#eab308', boxShadow: '0 0 10px rgba(234, 179, 8, 0.4)' }}></div>
            <span className="legend-text">50-100</span>
            <span className="legend-badge moderate">📊 MODERATE</span>
          </div>
          <div className="legend-row">
            <div className="legend-dot" style={{ background: '#22c55e', boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)' }}></div>
            <span className="legend-text">1-50</span>
            <span className="legend-badge low">📍 LOW</span>
          </div>
        </div>
      </div>
    </div>
  )

  // FULLSCREEN VIEW
  if (isFullscreen) {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
          margin: 0,
          padding: 0,
          background: '#e0f2fe'
        }}
      >
        <MapView />
        
        <button
          onClick={toggleFullscreen}
          className="fixed top-6 right-6 z-[1000000] map-button-close"
        >
          <Minimize2 size={20} />
          <span>Exit Fullscreen</span>
        </button>
      </div>
    )
  }

  // NORMAL VIEW
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#e0f2fe' }}>
      <MapView />
      
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] map-button"
      >
        <Maximize2 size={18} />
        <span>Expand Map</span>
      </button>
    </div>
  )
}
