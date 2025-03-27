import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import pptxgen from 'pptxgenjs';
import { Wand2, Download, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
// Initialize Gemini AI
const ai = new GoogleGenAI({apiKey:import.meta.env.VITE_PUBLIC_GEMINI_API_KEY}); // Replace with your API key

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

    // Add title slide
    const titleSlide = pres.addSlide();
    titleSlide.addText(idea, {
      x: '10%',
      y: '40%',
      w: '80%',
      fontSize: 44,
      align: 'center',
      bold: true,
      color: '363636',
    });

    // Add content slides
    slides.forEach((slide) => {
      const newSlide = pres.addSlide();
      
      // Add title
      newSlide.addText(slide.title, {
        x: '5%',
        y: '5%',
        w: '90%',
        fontSize: 32,
        bold: true,
        color: '363636',
      });

      // Add bullet points - Fixed: Process each content item separately
      slide.content.forEach((point, idx) => {
        newSlide.addText(point, {
          x: '5%',
          y: `${25 + (idx * 10)}%`,
          w: '90%',
          fontSize: 18,
          bullet: true,
          color: '666666',
        });
      });
    });

    // Save the presentation
    await pres.writeFile({ fileName: 'pitch-deck.pptx' });
    toast.success('Pitch deck downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Pitch Deck Generator</h1>
          <p className="text-lg text-gray-600">Transform your business idea into a professional pitch deck</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your business idea
            </label>
            <textarea
              id="idea"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your business idea here..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={generatePitchDeck}
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-5 h-5 mr-2" />
              )}
              Generate Pitch Deck
            </button>

            <button
              onClick={downloadPPT}
              disabled={slides.length === 0}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PPT
            </button>
          </div>
        </div>

        {slides.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Preview</h2>
            <div className="space-y-6">
              {slides.map((slide, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{slide.title}</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {slide.content.map((point, i) => (
                      <li key={i} className="text-gray-600">{point}</li>
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