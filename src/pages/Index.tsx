import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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
    
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: 'Поиск выполнен',
        description: 'Результаты появятся здесь',
      });
    }, 1500);
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
            Telegram Finder
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Быстрый поиск пользователей Telegram по номеру телефона или username
          </p>
        </div>

        <Card className="p-6 md:p-10 shadow-2xl backdrop-blur-sm bg-card/95 border-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
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
      </div>
    </div>
  );
}
