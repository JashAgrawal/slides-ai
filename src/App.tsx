import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import pptxgen from 'pptxgenjs';
import { Wand2, Download, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_PUBLIC_GEMINI_API_KEY });

interface Slide {
  title: string;
  content: string[];
}

function App() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);

  const generatePitchDeck = async () => {
    if (!idea.trim()) {
      toast.error('Please enter your business idea');
      return;
    }

    setLoading(true);
    try {
      
      const prompt = `Create a pitch deck for the following business idea: ${idea}. 
      Format the response as JSON with the following structure for 8 slides:
      {
        "slides": [
          {
            "title": "slide title",
            "content": ["point 1", "point 2", "point 3"]
          }
        ]
      }
      Include slides for: Problem, Solution, Market Size, Business Model, Competition, Go-to-Market Strategy, Team, and Financial Projections.
      IMPORTANT NOTE :- THE RESPONSE SHOULD BE VALID JSON ONLY SUCH THAT JSON.PARSE() should be able to decode it`;
const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });
      const text = response.text.trim();
      console.log(text)
      const match = text.match(/```json\n([\s\S]*?)\n```/);
      console.log(match)
if (match) {
  try {
   const parsedResponse = JSON.parse(match[1]);
      setSlides(parsedResponse.slides);
      toast.success('Pitch deck generated successfully!');
  } catch (error) {
    throw new Error("Invalid Json")
    console.error("Invalid JSON:", error);
  }
} else {
      throw new Error("Invalid Json")
}

      
      // Parse the JSON response
      
    } catch (error) {
      console.error('Error generating pitch deck:', error);
      toast.error('Failed to generate pitch deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPPT = async () => {
    if (slides.length === 0) {
      toast.error('Generate a pitch deck first');
      return;
    }

    const pres = new pptxgen();
    slides.forEach((slide) => {
      const newSlide = pres.addSlide();
      newSlide.addText(slide.title, { x: '5%', y: '5%', w: '90%', fontSize: 32, bold: true, color: 'FFFFFF' });
      slide.content.forEach((point, idx) => {
        newSlide.addText(point, { x: '5%', y: `${25 + (idx * 10)}%`, w: '90%', fontSize: 18, bullet: true, color: 'AAAAAA' });
      });
    });

    await pres.writeFile({ fileName: 'pitch-deck.pptx' });
    toast.success('Pitch deck downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center items-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">AI Pitch Deck Generator</h1>
        <p className="text-center text-gray-400 mb-6">Generate professional pitch decks instantly</p>

        <textarea
          className="w-full p-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
          placeholder="Describe your business idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
        />

        <div className="flex gap-4">
          <button
            onClick={generatePitchDeck}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 mr-2" />}
            Generate
          </button>
          <button
            onClick={downloadPPT}
            disabled={slides.length === 0}
            className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </button>
        </div>

        {slides.length > 0 && (
          <div className="mt-8 p-6 bg-gray-700 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="space-y-4">
              {slides.map((slide, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-bold">{slide.title}</h3>
                  <ul className="list-disc list-inside text-gray-400">
                    {slide.content.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;