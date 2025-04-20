import { Text, View } from 'react-native';

export default function Main() {
  return (
    <View className="flex-1 bg-gray-100">
      {/* Navbar */}
      <View className="flex-row bg-yellow-400 px-4 py-3 shadow-xl rounded-b-lg justify-around items-center border-b border-gray-300">
        <Text className="text-xl font-extrabold text-black">NIYAM</Text>
        <Text className="text-lg font-semibold text-white">Blogs</Text>
        <Text className="text-lg font-semibold text-white">Audiobooks</Text>
        <Text className="text-lg font-semibold text-white">Meditations</Text>
        <Text className="text-lg font-semibold text-white">Films</Text>
        <Text className="text-lg font-semibold text-white">E-Books</Text>
        <Text className="text-lg font-semibold text-white">Logout</Text>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-gray-700">Hello 👋</Text>
      </View>
    </View>
  );
}
