import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProfileContext } from '../../../context/ProfileContext';

export default function TripPlannerScreen() {
  const router = useRouter();
  const { trip, updateTrip } = useContext(ProfileContext);

  const [destination, setDestination] = useState(trip.destination);
  const [duration, setDuration] = useState(trip.duration);
  const [purpose, setPurpose] = useState(trip.purpose);
  const [departureDate, setDepartureDate] = useState(trip.departureDate);

  const handleSave = () => {
    if (!destination.trim()) {
      Alert.alert("Required", "Destination cannot be empty.");
      return;
    }
    updateTrip({
      destination: destination.trim(),
      duration: duration.trim(),
      purpose: purpose.trim(),
      departureDate: departureDate.trim()
    });
    Alert.alert("Saved", "Your trip itinerary has been updated!");
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Planner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>Plan your next trip to tailor lessons and recommendations automatically.</Text>

        <View style={styles.form}>
          {/* Destination */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Where are you traveling to?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Paris, France"
              value={destination}
              onChangeText={setDestination}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Departure Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departure Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={departureDate}
              onChangeText={setDepartureDate}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Duration */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 14 days"
              value={duration}
              onChangeText={setDuration}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Purpose */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Purpose of Trip</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tourism, Business"
              value={purpose}
              onChangeText={setPurpose}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Itinerary</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    backgroundColor: '#FFF',
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    },
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  introText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    }
});
