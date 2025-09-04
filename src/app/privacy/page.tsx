"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Политика за поверителност
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Как защитаваме и използваме вашата лична информация
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  1. Въведение
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    ИNSOMNИA се ангажира да защитава вашата поверителност. Тази
                    политика обяснява как събираме, използваме и защитаваме
                    вашата лична информация, когато посещавате нашия уебсайт или
                    използвате нашите услуги.
                  </p>
                  <p>
                    С използването на нашите услуги, вие се съгласявате със
                    събирането и използването на информацията в съответствие с
                    тази политика.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. Каква информация събираме
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>Събираме следните видове информация:</p>
                  <h3 className="text-xl font-semibold text-white mt-4 mb-2">
                    Лична информация:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Име и фамилия</li>
                    <li>Email адрес</li>
                    <li>Телефонен номер</li>
                    <li>Адрес за доставка</li>
                    <li>Информация за плащане</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-white mt-4 mb-2">
                    Автоматично събирана информация:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP адрес</li>
                    <li>Тип браузър</li>
                    <li>Операционна система</li>
                    <li>Страници, които посещавате</li>
                    <li>Време на посещение</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. Как използваме информацията
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>Използваме събраната информация за:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Обработване на поръчки и доставка</li>
                    <li>Комуникация с вас относно поръчките</li>
                    <li>Предоставяне на клиентска поддръжка</li>
                    <li>
                      Изпращане на маркетингови съобщения (с вашето съгласие)
                    </li>
                    <li>Подобряване на нашите услуги</li>
                    <li>Предотвратяване на измами и злоупотреба</li>
                    <li>Спазване на правни изисквания</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Споделяне на информация
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Не продаваме, не разменяме и не предаваме вашата лична
                    информация на трети страни, с изключение на следните случаи:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>С вашето изрично съгласие</li>
                    <li>
                      За обработка на плащания (банки, платежни процесори)
                    </li>
                    <li>За доставка (куриерски компании)</li>
                    <li>Когато това е необходимо по закон</li>
                    <li>За защита на нашите права и собственост</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Защита на информацията
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Прилагаме различни мерки за сигурност за защита на вашата
                    лична информация:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Шифроване на данните при предаване (SSL/TLS)</li>
                    <li>Шифроване на данните в покой</li>
                    <li>Регулярни проверки за сигурност</li>
                    <li>Ограничен достъп до личната информация</li>
                    <li>Регулярни резервни копия</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Бисквитки (Cookies)
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Използваме бисквитки за подобряване на вашето потребителско
                    изживяване:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Необходими бисквитки за функционирането на сайта</li>
                    <li>Аналитични бисквитки за разбиране на използването</li>
                    <li>Функционални бисквитки за персонализиране</li>
                    <li>Маркетингови бисквитки (с вашето съгласие)</li>
                  </ul>
                  <p>
                    Можете да контролирате използването на бисквитки чрез
                    настройките на вашия браузър.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Вашите права
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>Имате следните права относно вашата лична информация:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Достъп до вашите данни</li>
                    <li>Корекция на неточни данни</li>
                    <li>Изтриване на данните</li>
                    <li>Ограничаване на обработката</li>
                    <li>Преносимост на данните</li>
                    <li>Възражение срещу обработката</li>
                    <li>Оттегляне на съгласието</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Запазване на данните
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Запазваме вашата лична информация само толкова дълго,
                    колкото е необходимо за:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Предоставяне на нашите услуги</li>
                    <li>Спазване на правни изисквания</li>
                    <li>Разрешаване на спорове</li>
                    <li>Прилагане на нашите договори</li>
                  </ul>
                  <p>
                    Обикновено това е период от 7 години след последната
                    транзакция.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Международни прехвърляния
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Вашата информация може да бъде прехвърлена и обработвана в
                    страни извън Европейския съюз. В такива случаи гарантираме,
                    че:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Страната има адекватно ниво на защита</li>
                    <li>Използваме стандартни договорни клаузи</li>
                    <li>Прилагаме подходящи мерки за сигурност</li>
                  </ul>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Промени в политиката
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Може да актуализираме тази политика за поверителност от
                    време на време. Ще ви уведомим за всяка промяна чрез:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email уведомление</li>
                    <li>Известие на уебсайта</li>
                    <li>Обновяване на датата на последната промяна</li>
                  </ul>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  11. Контактна информация
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Ако имате въпроси относно тази политика за поверителност или
                    искате да упражните вашите права, свържете се с нас:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email: privacy@insomnia.bg</li>
                    <li>Телефон: +359 888 123 456</li>
                    <li>Адрес: ул. "Примерна" 123, София 1000</li>
                    <li>DPO: dpo@insomnia.bg</li>
                  </ul>
                  <p>
                    Имате право да подадете жалба до Комисията за защита на
                    личните данни, ако смятате, че обработката на вашите данни
                    нарушава GDPR.
                  </p>
                </div>
              </section>

              {/* Last Updated */}
              <div className="border-t border-gray-700 pt-6 mt-8">
                <p className="text-sm text-gray-400 text-center">
                  Последна актуализация:{" "}
                  {new Date().toLocaleDateString("bg-BG")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Link href="/register">
            <Button variant="outline" className="px-8 py-3">
              Назад към регистрацията
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
