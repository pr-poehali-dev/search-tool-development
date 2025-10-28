import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface OsintDataItem {
  text: string;
  url: string;
}

interface OsintSource {
  name: string;
  icon: string;
  data: Record<string, OsintDataItem>;
}

interface OsintResult {
  success: boolean;
  searchType: string;
  query: string;
  sources: OsintSource[];
  timestamp: number;
}

export default function Index() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<OsintResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<OsintResult[]>([]);
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{10,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateUsername = (user: string): boolean => {
    const usernameRegex = /^@?[a-zA-Z0-9_]{5,32}$/;
    return usernameRegex.test(user);
  };

  const handleSearch = async () => {
    if (!phoneNumber && !username) {
      toast({
        title: 'Ошибка',
        description: 'Введите хотя бы один параметр для поиска',
        variant: 'destructive',
      });
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Неверный формат',
        description: 'Проверьте формат номера телефона',
        variant: 'destructive',
      });
      return;
    }

    if (username && !validateUsername(username)) {
      toast({
        title: 'Неверный формат',
        description: 'Username должен содержать от 5 до 32 символов',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch('https://functions.poehali.dev/3f7cbc30-5359-4fd6-8f27-b0aff8e54dd6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          username: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при поиске');
      }

      if (data.success && data.sources) {
        setSearchResults(data);
        setSearchHistory(prev => [data, ...prev]);
        toast({
          title: 'Поиск выполнен',
          description: `Найдено источников: ${data.sources.length}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось выполнить поиск',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-10 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
      
      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-block mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl animate-scale-in">
            <Icon name="Search" size={36} className="text-white md:w-12 md:h-12" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent px-4">
            WPS Tools
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Поиск информации из открытых источников по номеру телефона или username
          </p>
        </div>

        <Card id="search-form" className="p-4 md:p-6 lg:p-10 shadow-2xl backdrop-blur-sm bg-card/95 border-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="Phone" size={16} className="text-primary md:w-[18px] md:h-[18px]" />
                Номер телефона
              </label>
              <Input
                type="tel"
                placeholder="+79999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 md:h-14 text-base md:text-lg border-2 focus:border-primary transition-all duration-300 hover:border-primary/50"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="Info" size={12} className="md:w-[14px] md:h-[14px]" />
                Пример: +79999999999
              </p>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative bg-card px-3 md:px-4">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">ИЛИ</span>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="AtSign" size={16} className="text-secondary md:w-[18px] md:h-[18px]" />
                Username
              </label>
              <Input
                type="text"
                placeholder="@madefferg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 md:h-14 text-base md:text-lg border-2 focus:border-secondary transition-all duration-300 hover:border-secondary/50"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="Info" size={12} className="md:w-[14px] md:h-[14px]" />
                Пример: @madefferg
              </p>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full h-12 md:h-14 text-base md:text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 active:opacity-80 transition-all duration-300 shadow-lg hover:shadow-xl md:hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSearching ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <Icon name="Loader2" size={20} className="animate-spin md:w-6 md:h-6" />
                  Поиск...
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-3">
                  <Icon name="Search" size={20} className="md:w-6 md:h-6" />
                  Найти информацию
                </div>
              )}
            </Button>
          </div>
        </Card>

        {searchResults && searchResults.sources && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Результаты поиска
                </h2>
                {searchHistory.length > 1 && (
                  <Button
                    onClick={() => setSearchResults(null)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    <span className="hidden sm:inline">История</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg w-fit max-w-full">
                <Icon name="Search" size={16} className="text-primary flex-shrink-0" />
                <span className="font-semibold text-sm truncate">{searchResults.query}</span>
              </div>
            </div>
            {searchResults.sources.map((source, idx) => (
              <Card 
                key={idx}
                className="p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex-shrink-0">
                      <Icon name={source.icon as any} size={24} className="text-primary md:w-7 md:h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg md:text-xl">{source.name}</h3>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 md:p-5 space-y-2 md:space-y-3">
                    {Object.entries(source.data).map(([key, value], dataIdx) => (
                      <a 
                        key={dataIdx} 
                        href={value.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-background rounded-md border border-border active:border-primary/50 active:bg-primary/5 md:hover:border-primary/50 md:hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
                      >
                        <Icon name="ExternalLink" size={14} className="text-primary mt-0.5 flex-shrink-0 group-active:scale-110 md:group-hover:scale-110 transition-transform md:w-4 md:h-4" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground block mb-0.5 md:mb-1 uppercase tracking-wide">{key}</span>
                          <p className="text-xs md:text-sm text-foreground group-active:text-primary md:group-hover:text-primary transition-colors break-words">{value.text}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!searchResults && searchHistory.length === 0 && (
          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: 'Zap', title: 'Быстро', desc: 'Результаты за секунды' },
              { icon: 'Shield', title: 'Безопасно', desc: 'Полная конфиденциальность' },
              { icon: 'Target', title: 'Точно', desc: 'Актуальные данные' }
            ].map((feature, idx) => (
              <Card 
                key={idx}
                className="p-4 md:p-6 text-center active:shadow-xl md:hover:shadow-xl transition-all duration-300 md:hover:scale-105 bg-gradient-to-br from-card to-muted/20 border-2 active:border-primary/50 md:hover:border-primary/50"
              >
                <div className="inline-block p-2 md:p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-3 md:mb-4">
                  <Icon name={feature.icon as any} size={28} className="text-primary md:w-8 md:h-8" />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        )}

        {searchHistory.length > 0 && !searchResults && (
          <div className="mt-8 md:mt-12 space-y-4 md:space-y-6 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              История поиска
            </h2>
            <div className="space-y-3 md:space-y-4">
              {searchHistory.map((historyItem, idx) => (
                <Card 
                  key={idx}
                  onClick={() => setSearchResults(historyItem)}
                  className="p-3 md:p-4 active:shadow-xl md:hover:shadow-xl transition-all duration-300 border-2 active:border-primary/50 md:hover:border-primary/50 cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 md:p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex-shrink-0">
                        <Icon name="History" size={18} className="text-primary md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm md:text-base group-active:text-primary md:group-hover:text-primary transition-colors truncate">{historyItem.query}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(historyItem.timestamp * 1000).toLocaleString('ru-RU', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={18} className="text-muted-foreground group-active:text-primary md:group-hover:text-primary transition-colors flex-shrink-0 md:w-5 md:h-5" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}