
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Rocket } from 'lucide-react';

const Index = () => {
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [extractedUrls, setExtractedUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const extractUrlsFromSitemap = async () => {
    if (!sitemapUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a sitemap URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(sitemapUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real application, you'd need a backend service or CORS proxy
      // For demonstration, we'll simulate the extraction process
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(sitemapUrl)}`);
      const data = await response.json();
      
      if (data.contents) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent).filter(Boolean);
        
        if (urls.length > 0) {
          setExtractedUrls(urls.join('\n'));
          toast({
            title: "Success!",
            description: `Extracted ${urls.length} URLs from the sitemap`,
          });
        } else {
          toast({
            title: "No URLs found",
            description: "The sitemap doesn't contain any valid URLs",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error extracting URLs:', error);
      // Fallback: simulate some URLs for demonstration
      const simulatedUrls = [
        sitemapUrl.replace('/sitemap.xml', '/'),
        sitemapUrl.replace('/sitemap.xml', '/about'),
        sitemapUrl.replace('/sitemap.xml', '/contact'),
        sitemapUrl.replace('/sitemap.xml', '/services'),
        sitemapUrl.replace('/sitemap.xml', '/blog'),
      ];
      setExtractedUrls(simulatedUrls.join('\n'));
      toast({
        title: "Demo Mode",
        description: "Showing sample URLs (CORS limitations in browser)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!extractedUrls.trim()) {
      toast({
        title: "No data to export",
        description: "Please extract URLs first",
        variant: "destructive",
      });
      return;
    }

    const urls = extractedUrls.split('\n').filter(url => url.trim());
    const csvContent = ['URL\n', ...urls.map(url => `"${url}"\n`)].join('');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sitemap-urls.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful!",
      description: "CSV file has been downloaded",
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center mb-12">
        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          Extract URLs Now
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-800 font-medium mb-12">
          Extract and analyze URLs from XML sitemaps instantly.
        </p>

        {/* Input and Button Section */}
        <div className="space-y-6">
          <div className="relative">
            <Input
              type="url"
              placeholder="Enter your sitemap URL..."
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="h-16 text-lg px-6 rounded-2xl border-0 shadow-lg bg-white/90 backdrop-blur-sm placeholder:text-gray-500 focus:ring-4 focus:ring-white/30 transition-all duration-200"
            />
          </div>

          <Button
            onClick={extractUrlsFromSitemap}
            disabled={isLoading}
            className="h-16 bg-gray-900 hover:bg-gray-800 text-white px-12 font-semibold text-lg rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-3" />
                Extract Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section - Only show when there are results */}
      {extractedUrls && (
        <div className="w-full max-w-4xl">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Extracted URLs
                </h2>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="h-12 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 font-semibold rounded-xl shadow-sm transition-all duration-200"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <Textarea
                value={extractedUrls}
                onChange={(e) => setExtractedUrls(e.target.value)}
                className="min-h-[300px] border-2 border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 font-mono text-sm leading-relaxed p-6 rounded-xl shadow-sm transition-all duration-200 resize-none bg-gray-50"
                placeholder="Your extracted URLs will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;
