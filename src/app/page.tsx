"use client";
import { TabsContent, TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Texto from "@/app/pages/Texto";
import IngredientRecognition from "@/app/pages/ingredientRecognition";
import ImageAnalysis from "@/app/pages/imageAnalysis";
import Oroi from "./ _components/header";
export default function Home() {
  const router = useRouter();
  return (
    <div>
      <Oroi />
      <div className="flex justify-center">
        <Tabs defaultValue="ingredientRecognition">
          <TabsList>
            <TabsTrigger value="ingredientRecognition">
              Ingredient recognition{" "}
            </TabsTrigger>
            <TabsTrigger value="ImageAnalysis">ImageAnalysis</TabsTrigger>
            <TabsTrigger value="Texto">Texto</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredientRecognition">
            <IngredientRecognition />
          </TabsContent>

          <TabsContent value="ImageAnalysis">
            <ImageAnalysis />
          </TabsContent>
          <TabsContent value="Texto">
            <Texto />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
