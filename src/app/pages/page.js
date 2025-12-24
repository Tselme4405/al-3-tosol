// "use client";
// import { TabsContent, TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
// import { useRouter } from "next/navigation";
// import ImageAnalysis from "./imageAnalysis";
// import IngredientRecognition from "./ingredientRecognition";
// export default function DeedHoyor() {
//   const router = useRouter();
//   return (
//     <Tabs defaultValue="account">
//       <TabsList>
//         <TabsTrigger value="ingredientRecognition">
//           Ingredient recognition{" "}
//         </TabsTrigger>
//         <TabsTrigger value="ImageAnalysis">ImageAnalysis</TabsTrigger>
//       </TabsList>

//       <TabsContent value="ingredientRecognition">
//         <IngredientRecognition />
//       </TabsContent>

//       <TabsContent value="ImageAnalysis">
//         <ImageAnalysis />
//       </TabsContent>
//     </Tabs>
//   );
// }
