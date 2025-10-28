import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  source: string;
  description: string;
  query: string;
  found: boolean;
  response_text?: string;
  error?: string;
  data: any;
}

export default function Index() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
    setSearchResults([]);
    
    try {
      const response = await fetch('https://functions.poehali.dev/05fb67f4-e315-4696-9660-751f59dcdd23', {
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

      if (data.success && data.results) {
        setSearchResults(data.results);
        toast({
          title: 'Поиск выполнен',
          description: `Найдено результатов: ${data.results.length}`,
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
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Быстрый поиск пользователей Telegram по номеру телефона или username
          </p>

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                Запуск ботов...
              </>
            ) : (
              <>
                <Icon name="Rocket" size={24} className="mr-2" />
                Начать пользоваться
              </>
            )}
          </Button>
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

        {searchResults.length > 0 && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Найденная информация
            </h2>
            {searchResults.map((result, idx) => (
              <Card 
                key={idx}
                className="p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                      <Icon name="Bot" size={28} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-xl">@{result.source}</h3>
                        {result.found ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Icon name="CheckCircle2" size={14} />
                            Найдено
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Icon name="XCircle" size={14} />
                            Не найдено
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{result.description}</p>
                    </div>
                  </div>

                  {result.response_text && (
                    <div className="bg-muted/50 rounded-lg p-5 space-y-3">
                      <h4 className="font-bold text-base uppercase tracking-wide text-primary flex items-center gap-2">
                        <Icon name="MessageCircle" size={18} />
                        Ответ от бота
                      </h4>
                      <div className="bg-background rounded-md p-4 border border-border">
                        <pre className="whitespace-pre-wrap text-sm font-sans text-foreground leading-relaxed">{result.response_text}</pre>
                      </div>
                    </div>
                  )}

                  {result.data && Object.keys(result.data).length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-primary flex items-center gap-2">
                        <Icon name="FileText" size={16} />
                        Данные
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.data.search_term && (
                          <div className="flex items-start gap-2">
                            <Icon name="Search" size={16} className="text-primary mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block">Запрос</span>
                              <code className="text-sm font-mono bg-background px-2 py-1 rounded">{result.data.search_term}</code>
                            </div>
                          </div>
                        )}

                        {result.data.status && (
                          <div className="flex items-start gap-2">
                            <Icon name="Activity" size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block">Статус</span>
                              <span className="text-sm font-semibold text-green-600">{result.data.status}</span>
                            </div>
                          </div>
                        )}

                        {result.data.messages_received !== undefined && (
                          <div className="flex items-start gap-2">
                            <Icon name="MessageSquare" size={16} className="text-secondary mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block">Сообщений получено</span>
                              <span className="text-sm font-semibold">{result.data.messages_received}</span>
                            </div>
                          </div>
                        )}

                        {result.data.bot_username && (
                          <div className="flex items-start gap-2">
                            <Icon name="AtSign" size={16} className="text-primary mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block">Username бота</span>
                              <span className="text-sm font-semibold">@{result.data.bot_username}</span>
                            </div>
                          </div>
                        )}

                        {result.data.bot_name && (
                          <div className="flex items-start gap-2">
                            <Icon name="User" size={16} className="text-secondary mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block">Имя бота</span>
                              <span className="text-sm font-semibold">{result.data.bot_name}</span>
                            </div>
                          </div>
                        )}

                        {result.data.bot_id && (
                          <div className="flex items-start gap-2">
                            <Icon name="Hash" size={16} className="text-muted-foreground mt-0.5" />
                            <div>
                              <span className="text-xs font-medium text-muted-foreground block">ID бота</span>
                              <code className="text-sm font-mono">{result.data.bot_id}</code>
                            </div>
                          </div>
                        )}
                      </div>

                      {result.error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700">
                            <Icon name="AlertCircle" size={16} />
                            <span className="text-sm font-medium">{result.error}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {searchResults.length === 0 && (
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
      </div>
    </div>
  );
}