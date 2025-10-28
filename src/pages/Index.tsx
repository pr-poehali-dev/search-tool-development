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
    setSearchResults(null);
    
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
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6 p-4 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl animate-scale-in">
            <Icon name="Search" size={48} className="text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            WPS Tools
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Поиск информации из открытых источников по номеру телефона или username
          </p>
        </div>

        <Card id="search-form" className="p-6 md:p-10 shadow-2xl backdrop-blur-sm bg-card/95 border-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="Phone" size={18} className="text-primary" />
                Номер телефона
              </label>
              <Input
                type="tel"
                placeholder="+79999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-14 text-lg border-2 focus:border-primary transition-all duration-300 hover:border-primary/50"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="Info" size={14} />
                Пример: +79999999999
              </p>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative bg-card px-4">
                <span className="text-sm font-medium text-muted-foreground">ИЛИ</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Icon name="AtSign" size={18} className="text-secondary" />
                Username
              </label>
              <Input
                type="text"
                placeholder="@madefferg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-lg border-2 focus:border-secondary transition-all duration-300 hover:border-secondary/50"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Icon name="Info" size={14} />
                Пример: @madefferg
              </p>
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSearching ? (
                <div className="flex items-center gap-3">
                  <Icon name="Loader2" size={24} className="animate-spin" />
                  Поиск...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Icon name="Search" size={24} />
                  Найти в Telegram
                </div>
              )}
            </Button>
          </div>
        </Card>

        {searchResults && searchResults.sources && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Результаты поиска
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                  <Icon name="Search" size={18} className="text-primary" />
                  <span className="font-semibold text-sm">{searchResults.query}</span>
                </div>
                {searchHistory.length > 1 && (
                  <Button
                    onClick={() => setSearchResults(null)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Icon name="ArrowLeft" size={16} />
                    История
                  </Button>
                )}
              </div>
            </div>
            {searchResults.sources.map((source, idx) => (
              <Card 
                key={idx}
                className="p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                      <Icon name={source.icon as any} size={28} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2">{source.name}</h3>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-5 space-y-3">
                    {Object.entries(source.data).map(([key, value], dataIdx) => (
                      <a 
                        key={dataIdx} 
                        href={value.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 bg-background rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
                      >
                        <Icon name="ExternalLink" size={16} className="text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-muted-foreground block mb-1 uppercase tracking-wide">{key}</span>
                          <p className="text-sm text-foreground group-hover:text-primary transition-colors">{value.text}</p>
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
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: 'Zap', title: 'Быстро', desc: 'Результаты за секунды' },
              { icon: 'Shield', title: 'Безопасно', desc: 'Полная конфиденциальность' },
              { icon: 'Target', title: 'Точно', desc: 'Актуальные данные' }
            ].map((feature, idx) => (
              <Card 
                key={idx}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-muted/20 border-2 hover:border-primary/50"
              >
                <div className="inline-block p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-4">
                  <Icon name={feature.icon as any} size={32} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        )}

        {searchHistory.length > 0 && !searchResults && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              История поиска
            </h2>
            <div className="space-y-4">
              {searchHistory.map((historyItem, idx) => (
                <Card 
                  key={idx}
                  onClick={() => setSearchResults(historyItem)}
                  className="p-4 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                        <Icon name="History" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">{historyItem.query}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(historyItem.timestamp * 1000).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
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