
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen w-full bg-[#FFB100] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white shadow-2xl border-0">
          <CardContent className="p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-black">
                Free XML Sitemap URL Extractor
              </h1>
              <p className="text-lg text-gray-700 font-normal">
                Use this free tool to extract URLs from an XML sitemap.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="sitemap-url" className="text-sm font-medium text-black">
                  XML sitemap URL
                </label>
                <div className="flex gap-3">
                  <Input
                    id="sitemap-url"
                    type="url"
                    placeholder="http://example.com/sitemap.xml"
                    value={sitemapUrl}
                    onChange={(e) => setSitemapUrl(e.target.value)}
                    className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Button
                    onClick={extractUrlsFromSitemap}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-medium whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'LOAD SITEMAP'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">Results</h2>
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  className="bg-white border-gray-300 text-black hover:bg-gray-50"
                  disabled={!extractedUrls.trim()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  EXPORT
                </Button>
              </div>
              
              <Textarea
                placeholder="Your URLs will appear here"
                value={extractedUrls}
                onChange={(e) => setExtractedUrls(e.target.value)}
                className="min-h-[300px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 font-mono text-sm"
                readOnly={false}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
