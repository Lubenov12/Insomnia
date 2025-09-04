"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Общи условия
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Моля, прочетете внимателно тези общи условия преди да използвате
              нашите услуги
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
                  1. Приемане на условията
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    С достъпването и използването на уебсайта на ИNSOMNИA, вие
                    се съгласявате да спазвате и да сте обвързани с тези общи
                    условия. Ако не се съгласявате с която и да е част от тези
                    условия, моля, не използвайте нашите услуги.
                  </p>
                  <p>
                    Тези условия се прилагат за всички посетители, потребители и
                    други лица, които достъпват или използват уебсайта.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  2. Описание на услугите
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    ИNSOMNИA предоставя онлайн платформа за продажба на дрехи и
                    аксесоари. Нашите услуги включват:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Разглеждане на продукти</li>
                    <li>Онлайн поръчки</li>
                    <li>Доставка на продукти</li>
                    <li>Клиентска поддръжка</li>
                    <li>Управление на потребителски акаунти</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. Регистрация и акаунти
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    За да използвате определени функции на нашия уебсайт, може
                    да се наложи да създадете акаунт. Вие отговаряте за:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Предоставянето на точна и пълна информация при регистрация
                    </li>
                    <li>Защитата на вашата парола и акаунт</li>
                    <li>
                      Всички действия, които се извършват чрез вашия акаунт
                    </li>
                    <li>
                      Уведомяването ни незабавно за всяко неоторизирано
                      използване
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  4. Поръчки и плащания
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>При поръчване на продукти, вие се съгласявате да:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Предоставите точна информация за доставка</li>
                    <li>Платите всички такси, свързани с поръчката</li>
                    <li>
                      Приемете, че цените могат да се променят без предварително
                      уведомление
                    </li>
                    <li>
                      Разберете, че поръчките могат да бъдат отхвърлени поради
                      недостиг на продукти
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  5. Доставка и връщане
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>Нашата политика за доставка и връщане включва:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Доставка в рамките на 3-5 работни дни</li>
                    <li>Възможност за връщане в рамките на 14 дни</li>
                    <li>Продуктите трябва да бъдат в оригинално състояние</li>
                    <li>Такси за доставка не се връщат</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  6. Интелектуална собственост
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Цялото съдържание на уебсайта, включително текстове,
                    изображения, логотипи и дизайн, е собственост на ИNSOMNИA и
                    е защитено от законите за интелектуална собственост.
                  </p>
                  <p>
                    Забранено е копирането, разпространяването или използването
                    на това съдържание без нашето писмено разрешение.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  7. Ограничаване на отговорността
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>ИNSOMNИA не носи отговорност за:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Косвени, случайни или специални щети</li>
                    <li>Загуби на данни или прекъсване на услугата</li>
                    <li>Действия на трети страни</li>
                    <li>Проблеми, свързани с интернет връзката</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  8. Промени в условията
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Запазваме си правото да променяме тези общи условия по всяко
                    време. Промените влизат в сила веднага след публикуването им
                    на уебсайта.
                  </p>
                  <p>
                    Препоръчваме ви да проверявате редовно тези условия за
                    актуализации.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  9. Приложимо право
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Тези общи условия се управляват и тълкуват в съответствие с
                    българското законодателство. Всички спорове ще бъдат
                    разрешавани от компетентните български съдилища.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  10. Контактна информация
                </h2>
                <div className="text-gray-300 space-y-3">
                  <p>
                    Ако имате въпроси относно тези общи условия, моля, свържете
                    се с нас:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Email: legal@insomnia.bg</li>
                    <li>Телефон: +359 888 123 456</li>
                    <li>Адрес: ул. "Примерна" 123, София 1000</li>
                  </ul>
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
