import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const data = {
  greetings: [
    { front: "Hello / Good Morning", back: "Ohayou Gozaimasu" },
    { front: "Good Afternoon", back: "Konnichiwa" },
    { front: "Good Evening", back: "Konbanwa" },
    { front: "Thank You", back: "Arigatou" },
  ],

  food: [
    { front: "Water", back: "Mizu" },
    { front: "Rice", back: "Gohan" },
    { front: "Tea", back: "Ocha" },
    { front: "Menu", back: "Menyuu" },
  ],

  transport: [
    { front: "Bus", back: "Basu" },
    { front: "Train", back: "Densha" },
    { front: "Taxi", back: "Takushii" },
    { front: "Station", back: "Eki" },
  ],

  emergency: [
    { front: "Help!", back: "Tasukete!" },
    { front: "Call Police", back: "Keisatsu o yonde" },
    { front: "Hospital", back: "Byouin" },
    { front: "I am lost", back: "Michi ni mayotta" },
  ],

  shopping: [
    { front: "How much?", back: "Ikura desu ka?" },
    { front: "Too expensive", back: "Takai desu" },
    { front: "Discount", back: "Waribiki" },
    { front: "I will buy this", back: "Kore o kaimasu" },
  ],

  hotel: [
    { front: "Reservation", back: "Yoyaku" },
    { front: "Room", back: "Heya" },
    { front: "Check-in", back: "Chekku-in" },
    { front: "Check-out", back: "Chekku-auto" },
  ],
};

export default function Flashcards() {
  const { category } = useLocalSearchParams();
  const cards = data[category];

  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{category?.toUpperCase()}</Text>

      {/* Flashcard */}
      <TouchableOpacity onPress={() => setFlip(!flip)}>
        <LinearGradient
          colors={["#4f46e5", "#9333ea"]}
          style={styles.card}
        >
          <Text style={styles.cardText}>
            {flip ? cards[index].back : cards[index].front}
          </Text>
          <Text style={styles.smallText}>Tap to flip</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.smallBtn}>
          <Text>🔊 Listen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn}>
          <Text>❤️ Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallBtn}>
          <Text onPress={() => setIndex(0)}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.practiceBtn}
          onPress={() => alert("Practice again")}
        >
          <Text style={styles.btnText}>Need Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gotBtn}
          onPress={() => setIndex((index + 1) % cards.length)}
        >
          <Text style={styles.btnText}>Got It</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f5f7",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    width: 300,
    height: 200,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  cardText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
  },

  smallText: {
    color: "#ddd",
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    marginTop: 20,
  },

  smallBtn: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    elevation: 2,
  },

  practiceBtn: {
    backgroundColor: "#ff2d55",
    padding: 15,
    borderRadius: 12,
    margin: 10,
  },

  gotBtn: {
    backgroundColor: "#10b981",
    padding: 15,
    borderRadius: 12,
    margin: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});