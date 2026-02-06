import React, { useState, useEffect } from "react";
import { Ghost, Plus, Trash2, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "./firebase"; // Future Backend Connection
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
export default function PantryGhost() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState<string | null>(null);
  const [isSummoning, setIsSummoning] = useState(false);

  // FRONTEND LOGIC: Add local ingredient
  const addIngredient = async() => {
    if (input.trim()) {
      // setIngredients([...ingredients, input.trim()]);
      // setInput("");
      try{
        await addDoc(collection(db, "pantry"), {// waiting for backend connection to add ingredient to firestore
          name: input.trim(), // add ingredient name to firestore
          createdAt: new Date() // add timestamp to firestore
        });
        setInput(""); 
      } catch (e) {
        console.error("Error adding ingredient: ", e);
      }
    }
  };

  useEffect(() => {
  const q = query(collection(db, "pantry"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map(doc => doc.data().name);
    setIngredients(items);
  });
  return () => unsubscribe(); // Cleanup connection on unmount
}, []);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* 1. LEFT SIDEBAR: THE PANTRY */}
      <aside className="w-80 border-r bg-white p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <span>Recipe Generator</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Add Ingredient</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Garlic" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
            />
            <Button size="icon" onClick={addIngredient}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="flex flex-wrap gap-2">
            {ingredients.map((item, index) => (
              <Badge key={index} variant="secondary" className="py-1 px-3 flex items-center gap-2 group">
                {item}
                <Trash2 
                  className="h-3 w-3 cursor-pointer opacity-50 group-hover:opacity-100 text-red-500" 
                  onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                />
              </Badge>
            ))}
            {ingredients.length === 0 && <p className="text-xs text-zinc-400 italic">Your pantry is empty...</p>}
          </div>
        </ScrollArea>
      </aside>

      {/* 2. MAIN AREA: THE KITCHEN */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-end border-b pb-6">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight">The Recipe Generator</h2>
              <p className="text-zinc-500 mt-1">What shall we make today?</p>
            </div>
            <Button 
              disabled={ingredients.length === 0 || isSummoning} 
              onClick={() => setIsSummoning(true)}
              className="bg-orange-600 hover:bg-orange-700 h-12 px-8"
            >
              {isSummoning ? "Summoning..." : "Summon Recipe"}
            </Button>
          </div>

          {recipe ? (
            <Card className="border-none shadow-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="bg-orange-50/50 border-b">
                <div className="flex items-center gap-2 text-orange-600 text-sm font-bold uppercase tracking-widest">
                  <ChefHat className="h-4 w-4" />
                  Recipe Found
                </div>
                <CardTitle className="text-2xl mt-2">Fried Rice</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {recipe}
              </CardContent>
              <CardFooter className="text-[10px] text-zinc-400 border-t py-3">
                Generated via Gemini API • Context: SparkHacks 2026
              </CardFooter>
            </Card>
          ) : (
            <div className="h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-zinc-300 gap-4">
              {/* <Ghost className="h-20 w-20 opacity-20" /> */}
              <p className="font-medium italic">Waiting for ingredients...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}