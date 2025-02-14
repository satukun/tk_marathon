import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import messagesJa from "@/data/messages-array-ja";
import messagesEn from "@/data/messages-array-en";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageSwitcher } from "@/components/language-switcher";

const formSchema = z.object({
  nickname: z.string().min(1, "ニックネームは1文字以上で入力してください"),
  targetTime: z.string(),
  targetTimeInput: z.string()
    .min(6, "目標タイムは必須です")
    .regex(/^\d{6}$/, "6桁の数字を入力してください")
    .refine((val) => {
      const hours = parseInt(val.substring(0, 2));
      const minutes = parseInt(val.substring(2, 4));
      const seconds = parseInt(val.substring(4, 6));
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59;
    }, "正しい時間形式で入力してください"),
  targetTimeNumber: z.number().min(1).max(3),
  messageKey: z.string(),
  messageNumber: z.number().min(1).max(5),
  upperPhrase: z.string(),
  lowerPhrase: z.string(),
});

type RegistrationStep = "input" | "confirm" | "complete";

export function RunnerRegistrationForm() {
  const [step, setStep] = useState<RegistrationStep>("input");
  const [runnerId, setRunnerId] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { t, i18n } = useTranslation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      targetTime: "04:00:00",
      targetTimeInput: "040000",
      targetTimeNumber: 2,
      messageKey: "registration.form.message.options.1",
      messageNumber: 1,
      upperPhrase: "",
      lowerPhrase: "",
    },
  });

  const formatTimeString = (input: string): string => {
    const hours = input.substring(0, 2);
    const minutes = input.substring(2, 4);
    const seconds = input.substring(4, 6);
    return i18n.language === "ja" 
      ? `${hours}時間${minutes}分${seconds}秒`
      : `${hours}:${minutes}:${seconds}`;
  };

  const handleTimeInputBlur = (value: string) => {
    if (!value) {
      form.setValue('targetTimeInput', '040000');
      form.setValue('targetTime', '04:00:00');
      form.setValue('targetTimeNumber', 2);
      return;
    }

    const paddedValue = value.padStart(6, '0');
    const hours = parseInt(paddedValue.substring(0, 2));
    const minutes = parseInt(paddedValue.substring(2, 4));
    const seconds = parseInt(paddedValue.substring(4, 6));

    if (paddedValue.length === 6 && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      form.setValue('targetTime', formattedTime);
      
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      let timeNumber;
      if (totalSeconds <= 12600) { // 3時間30分 = 12600秒
        timeNumber = 1;
      } else if (totalSeconds <= 18000) { // 5時間 = 18000秒
        timeNumber = 2;
      } else {
        timeNumber = 3;
      }
      form.setValue('targetTimeNumber', timeNumber);
    } else if (paddedValue.length === 6) {
      form.setValue('targetTimeInput', '040000');
      form.setValue('targetTime', '04:00:00');
      form.setValue('targetTimeNumber', 2);
      toast.error(t('registration.form.targetTime.error.invalid'));
    }
  };

  const generateMessages = (messageNumber: number, targetTimeNumber: number) => {
    try {
      const messagesArray = i18n.language === "ja" ? messagesJa : messagesEn;
      const messageObj = messagesArray[messageNumber - 1];
      
      if (!messageObj) {
        console.error('Message object not found:', { messageNumber, targetTimeNumber });
        return { upperPhrase: "", lowerPhrase: "" };
      }

      const upperPhrase = messageObj.initial[Math.floor(Math.random() * messageObj.initial.length)];
      
      const timeArray = messageObj.time[targetTimeNumber - 1];
      if (!timeArray || !timeArray.length) {
        console.error('Time array not found:', { messageNumber, targetTimeNumber });
        return { upperPhrase, lowerPhrase: "" };
      }

      const lowerPhrase = timeArray[Math.floor(Math.random() * timeArray.length)];

      return { upperPhrase, lowerPhrase };
    } catch (error) {
      console.error('Error generating messages:', error);
      return { upperPhrase: "", lowerPhrase: "" };
    }
  };

  const handleConfirm = form.handleSubmit(async (values) => {
    try {
      setIsRegistering(true);
      const response = await fetch("/api/runners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          message: t(values.messageKey),
          language: i18n.language
        }),
      });

      if (!response.ok) {
        throw new Error(t('registration.error.failed'));
      }

      const data = await response.json();
      setRunnerId(data.runnerId);
      setStep("complete");
      toast.success(t('registration.success.registered'));
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(t('registration.error.failed'), {
        description: t('registration.error.tryAgain'),
      });
      setStep("input");
    } finally {
      setIsRegistering(false);
    }
  });

  const renderComplete = () => (
    <Card className="text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <CardTitle>{t('registration.complete.title')}</CardTitle>
        <CardDescription>{t('registration.complete.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">{t('registration.complete.runnerId')}</p>
          <p className="text-2xl font-bold">{runnerId}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{t('registration.complete.notice.save')}</p>
          <p>{t('registration.complete.notice.required')}</p>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            form.reset();
            setStep("input");
          }}
        >
          {t('registration.complete.button')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderConfirm = () => {
    const values = form.getValues();
    const formattedTime = formatTimeString(values.targetTimeInput);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('registration.confirmation.title')}</CardTitle>
          <CardDescription>{t('registration.confirmation.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">{t('registration.form.nickname.label')}</p>
              <p className="col-span-2">{values.nickname}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">{t('registration.form.targetTime.label')}</p>
              <p className="col-span-2">{formattedTime}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <p className="text-sm font-medium text-muted-foreground">{t('registration.form.message.label')}</p>
              <p className="col-span-2">{t(values.messageKey)}</p>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-2">{t('registration.confirmation.generatedMessage')}</p>
              <p className="text-lg mb-2">{values.upperPhrase}</p>
              <p className="text-lg">{values.lowerPhrase}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("input")}
              disabled={isRegistering}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('registration.confirmation.button.modify')}
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleConfirm}
              disabled={isRegistering}
            >
              {isRegistering ? t('common.loading') : t('registration.confirmation.button.register')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderForm = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('registration.title')}</CardTitle>
          <LanguageSwitcher />
        </div>
        <CardDescription>{t('registration.form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('registration.form.nickname.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('registration.form.nickname.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetTimeInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('registration.form.targetTime.label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="040000"
                      maxLength={6}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        handleTimeInputBlur(e.target.value);
                      }}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('registration.form.targetTime.format')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('registration.form.message.label')}</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      const messageNumber = parseInt(value);
                      const messageKey = `registration.form.message.options.${value}`;
                      form.setValue('messageKey', messageKey);
                      form.setValue('messageNumber', messageNumber);
                    }}
                    defaultValue="1"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('registration.form.message.placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {t(`registration.form.message.options.${num}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">{t('registration.form.submit')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { upperPhrase, lowerPhrase } = generateMessages(
      values.messageNumber,
      values.targetTimeNumber
    );
    
    form.setValue('upperPhrase', upperPhrase);
    form.setValue('lowerPhrase', lowerPhrase);
    
    setStep("confirm");
  };

  if (step === "complete") {
    return renderComplete();
  }

  if (step === "confirm") {
    return renderConfirm();
  }

  return renderForm();
}