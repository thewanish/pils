import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { Beer, toggleSaveBeer } from "../Redux/BeerSlice";

type Props = {
  beer: Beer;
  buttonText?: string;
  onPress?: () => void;
};

const BeerItem = ({ beer, buttonText = "Save", onPress }: Props) => {
  const dispatch = useDispatch();
  
  React.useEffect(() => {
    if (beer.image_url?.includes('places.googleapis')) {
      console.log(`⚠️ ${beer.pub_name}: Google Places image blocked`);
    } else if (beer.image_url?.includes('unsplash')) {
      console.log(`🖼️ ${beer.pub_name}: Using placeholder`);
    }
  }, [beer.pub_name, beer.image_url]);

  const isFirebaseStorageUrl = (url?: string) =>
    !!url && (
      url.startsWith("https://firebasestorage.googleapis.com/") ||
      url.startsWith("https://storage.googleapis.com/") ||
      url.startsWith("gs://") ||
      /https:\/\/places\.googleapis\.com\/v1\//.test(url) // Temporary: reuse cached images
    );

  return (
    <TouchableOpacity style={{ padding: 12 }} onPress={onPress}>
      {isFirebaseStorageUrl(beer.image_url) && (
        <Image
          source={{ uri: beer.image_url }}
          style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 10 }}
        />
      )}
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        {beer.name}
      </Text>

      <Text>{beer.pub_name}</Text>
      <Text>{beer.city}</Text>
      <Text>{beer.cheapest_price_nok} NOK</Text>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          dispatch(toggleSaveBeer(beer));
        }}
      >
        <Text style={{ color: "blue", marginTop: 6 }}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default BeerItem;
