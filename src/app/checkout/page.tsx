"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { clientAuth } from "@/lib/auth";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type GuestOrder = {
  name: string;
  region: string;
  city: string;
  address: string;
  phone: string;
  email: string;
};

type CartItem = {
  product_id: string;
  size: string;
  quantity: number;
  added_at: string;
  product_name?: string;
  product_price?: number;
  product_image?: string;
};

// Bulgarian regions data
const bulgarianRegions = [
  { value: "", label: "Изберете област" },
  { value: "blagoevgrad", label: "Благоевград" },
  { value: "burgas", label: "Бургас" },
  { value: "varna", label: "Варна" },
  { value: "veliko_tarnovo", label: "Велико Търново" },
  { value: "vidin", label: "Видин" },
  { value: "vraca", label: "Враца" },
  { value: "gabrovo", label: "Габрово" },
  { value: "dobrich", label: "Добрич" },
  { value: "kardzhali", label: "Кърджали" },
  { value: "kyustendil", label: "Кюстендил" },
  { value: "lovech", label: "Ловеч" },
  { value: "montana", label: "Монтана" },
  { value: "pazardzhik", label: "Пазарджик" },
  { value: "pernik", label: "Перник" },
  { value: "pleven", label: "Плевен" },
  { value: "plovdiv", label: "Пловдив" },
  { value: "razgrad", label: "Разград" },
  { value: "ruse", label: "Русе" },
  { value: "silistra", label: "Силистра" },
  { value: "sliven", label: "Сливен" },
  { value: "smolyan", label: "Смолян" },
  { value: "sofia_city", label: "София (град)" },
  { value: "sofia_region", label: "София (област)" },
  { value: "stara_zagora", label: "Стара Загора" },
  { value: "targovishte", label: "Търговище" },
  { value: "haskovo", label: "Хасково" },
  { value: "shumen", label: "Шумен" },
  { value: "yambol", label: "Ямбол" },
];

// Major Bulgarian cities by region
const bulgarianCities = {
  blagoevgrad: [
    "Благоевград",
    "Петрич",
    "Сандански",
    "Гоце Делчев",
    "Разлог",
    "Банско",
    "Якоруда",
    "Симитли",
    "Кресна",
    "Мелник",
  ],
  burgas: [
    "Бургас",
    "Сливен",
    "Ямбол",
    "Карнобат",
    "Айтос",
    "Поморие",
    "Несебър",
    "Созопол",
    "Приморско",
    "Царево",
    "Малко Търново",
  ],
  varna: [
    "Варна",
    "Добрич",
    "Шабла",
    "Балчик",
    "Каварна",
    "Аксаково",
    "Бяла",
    "Дългопол",
    "Провадия",
    "Суворово",
  ],
  veliko_tarnovo: [
    "Велико Търново",
    "Габрово",
    "Севлиево",
    "Павликени",
    "Горна Оряховица",
    "Лясковец",
    "Елена",
    "Златарица",
    "Дряново",
    "Трявна",
  ],
  vidin: [
    "Видин",
    "Лом",
    "Кула",
    "Белоградчик",
    "Брегово",
    "Димово",
    "Грамада",
    "Макреш",
    "Ново село",
    "Ружинци",
  ],
  vraca: [
    "Враца",
    "Мездра",
    "Бяла Слатина",
    "Козлодуй",
    "Оряхово",
    "Роман",
    "Хайредин",
    "Борован",
    "Мизия",
    "Криводол",
  ],
  gabrovo: [
    "Габрово",
    "Севлиево",
    "Трявна",
    "Дряново",
    "Елена",
    "Угърчин",
    "Плачковци",
    "Дебене",
    "Баните",
    "Севлиево",
  ],
  dobrich: [
    "Добрич",
    "Балчик",
    "Каварна",
    "Шабла",
    "Генерал Тошево",
    "Тервел",
    "Крушари",
    "Добричка",
    "Каварна",
    "Балчик",
  ],
  kardzhali: [
    "Кърджали",
    "Хасково",
    "Димитровград",
    "Харманли",
    "Свиленград",
    "Маджарово",
    "Кирково",
    "Крумовград",
    "Момчилград",
    "Ардино",
  ],
  kyustendil: [
    "Кюстендил",
    "Дупница",
    "Бобов дол",
    "Рила",
    "Кочериново",
    "Невестино",
    "Трекляно",
    "Сапарева баня",
    "Бобошево",
    "Кюстендил",
  ],
  lovech: [
    "Ловеч",
    "Троян",
    "Луковит",
    "Угърчин",
    "Ябланица",
    "Априлци",
    "Тетевен",
    "Плевен",
    "Левски",
    "Луковит",
  ],
  montana: [
    "Монтана",
    "Лом",
    "Берковица",
    "Вълчедръм",
    "Бойчиновци",
    "Брусарци",
    "Георги Дамяново",
    "Якимово",
    "Медковец",
    "Чипровци",
  ],
  pazardzhik: [
    "Пазарджик",
    "Пловдив",
    "Асеновград",
    "Карлово",
    "Стрелча",
    "Велинград",
    "Батак",
    "Белово",
    "Брацигово",
    "Септември",
  ],
  pernik: [
    "Перник",
    "Радомир",
    "Брезник",
    "Земен",
    "Трън",
    "Ковачевци",
    "Брезник",
    "Радомир",
    "Земен",
    "Трън",
  ],
  pleven: [
    "Плевен",
    "Левски",
    "Луковит",
    "Белене",
    "Гулянци",
    "Долна Митрополия",
    "Долни Дъбник",
    "Искър",
    "Кнежа",
    "Никопол",
  ],
  plovdiv: [
    "Пловдив",
    "Асеновград",
    "Карлово",
    "Стрелча",
    "Хисаря",
    "Съединение",
    "Калояново",
    "Марица",
    "Родопи",
    "Садово",
    "Стамболийски",
    "Съединение",
  ],
  razgrad: [
    "Разград",
    "Исперих",
    "Кубрат",
    "Лозница",
    "Цар Калоян",
    "Завет",
    "Самуил",
    "Исперих",
    "Кубрат",
    "Лозница",
  ],
  ruse: [
    "Русе",
    "Силистра",
    "Добрич",
    "Тутракан",
    "Разград",
    "Исперих",
    "Кубрат",
    "Лозница",
    "Цар Калоян",
    "Завет",
  ],
  silistra: [
    "Силистра",
    "Тутракан",
    "Дулово",
    "Алфатар",
    "Главиница",
    "Кайнарджа",
    "Силистра",
    "Тутракан",
    "Дулово",
    "Алфатар",
  ],
  sliven: [
    "Сливен",
    "Ямбол",
    "Карнобат",
    "Айтос",
    "Нова Загора",
    "Котел",
    "Твърдица",
    "Шабла",
    "Балчик",
    "Каварна",
  ],
  smolyan: [
    "Смолян",
    "Рудозем",
    "Мадан",
    "Златоград",
    "Неделино",
    "Девин",
    "Чепеларе",
    "Борино",
    "Доспат",
    "Смолян",
  ],
  sofia_city: ["София", "Столична община", "София-град", "Столична", "София"],
  sofia_region: [
    "Самоков",
    "Своге",
    "Ботевград",
    "Етрополе",
    "Пирдоп",
    "Правец",
    "Сливница",
    "Костинброд",
    "Драгоман",
    "Годеч",
    "Божурище",
    "Ихтиман",
    "Елин Пелин",
    "Костинброд",
  ],
  stara_zagora: [
    "Стара Загора",
    "Казанлък",
    "Чирпан",
    "Нова Загора",
    "Гурково",
    "Мъглиж",
    "Опан",
    "Раднево",
    "Гълъбово",
    "Николаево",
    "Павел баня",
    "Шипка",
  ],
  targovishte: [
    "Търговище",
    "Попово",
    "Омуртаг",
    "Антоново",
    "Опака",
    "Търговище",
    "Попово",
    "Омуртаг",
    "Антоново",
    "Опака",
  ],
  haskovo: [
    "Хасково",
    "Димитровград",
    "Харманли",
    "Свиленград",
    "Маджарово",
    "Кирково",
    "Крумовград",
    "Момчилград",
    "Ардино",
    "Хасково",
  ],
  shumen: [
    "Шумен",
    "Варна",
    "Добрич",
    "Провадия",
    "Нови пазар",
    "Велики Преслав",
    "Каспичан",
    "Хитрино",
    "Венец",
    "Шумен",
  ],
  yambol: [
    "Ямбол",
    "Елхово",
    "Болярово",
    "Стралджа",
    "Тунджа",
    "Ямбол",
    "Елхово",
    "Болярово",
    "Стралджа",
    "Тунджа",
  ],
};

// Checkout form component that will be wrapped by Stripe Elements
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [form, setForm] = useState<GuestOrder>({
    name: "",
    region: "",
    city: "",
    address: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Load cart from localStorage and calculate total
  useEffect(() => {
    const LOCAL_KEY = "insomnia_cart";
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const cartItems: CartItem[] = JSON.parse(raw);
      setCart(cartItems);

      const cartTotal = cartItems.reduce((sum, item) => {
        return sum + (item.product_price || 0) * item.quantity;
      }, 0);
      setTotal(cartTotal);
    }
  }, []);

  // Auto-fill form with user data if logged in
  useEffect(() => {
    const user = clientAuth.getCurrentUser();
    if (user && clientAuth.isAuthenticated()) {
      setIsLoggedIn(true);

      // Auto-fill the form with user data
      setForm({
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        region: user.region || "",
        city: user.city || "",
        address: user.address || "",
        phone: user.phone_number || "",
        email: user.email || "",
      });

      // Set available cities if region is available
      if (
        user.region &&
        bulgarianCities[user.region as keyof typeof bulgarianCities]
      ) {
        setAvailableCities(
          bulgarianCities[user.region as keyof typeof bulgarianCities]
        );
      }
    }
  }, []);

  // Update available cities when region changes
  useEffect(() => {
    if (
      form.region &&
      bulgarianCities[form.region as keyof typeof bulgarianCities]
    ) {
      setAvailableCities(
        bulgarianCities[form.region as keyof typeof bulgarianCities]
      );
      // Reset city if it's not in the new region
      if (
        !bulgarianCities[form.region as keyof typeof bulgarianCities].includes(
          form.city
        )
      ) {
        setForm((prev) => ({ ...prev, city: "" }));
      }
    } else {
      setAvailableCities([]);
      setForm((prev) => ({ ...prev, city: "" }));
    }
  }, [form.region]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Form validation function
  const validateForm = () => {
    if (!form.name.trim()) {
      return "Моля, въведете вашето име и фамилия";
    }
    if (!form.email.trim()) {
      return "Моля, въведете вашия имейл адрес";
    }
    if (!form.email.includes("@")) {
      return "Моля, въведете валиден имейл адрес";
    }
    if (!form.phone.trim()) {
      return "Моля, въведете вашия телефонен номер";
    }
    if (!form.region) {
      return "Моля, изберете област";
    }
    if (!form.city.trim()) {
      return "Моля, въведете град или населено място";
    }
    if (!form.address.trim()) {
      return "Моля, въведете вашия адрес за доставка";
    }
    if (form.address.length < 10) {
      return "Моля, въведете пълен адрес за доставка";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError(
        "Системата за плащане не е заредена. Моля, опреснете страницата и опитайте отново."
      );
      return;
    }

    if (cart.length === 0) {
      setError(
        "Количката е празна. Моля, добавете продукти преди да продължите с плащането."
      );
      return;
    }

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create payment intent
      const paymentData = {
        amount: total,
        currency: "bgn",
        customer: {
          ...form,
          fullAddress: `${form.address}, ${form.city}, ${
            bulgarianRegions.find((r) => r.value === form.region)?.label ||
            form.region
          }`,
        },
        items: cart.map((item) => ({
          product_id: item.product_id,
          name: item.product_name || "Продукт",
          quantity: item.quantity,
          price: item.product_price || 0,
          size: item.size,
        })),
        shipping: {
          method: "standard",
          cost: 0, // Free shipping for now
        },
      };

      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific server errors in Bulgarian
        let bulgarianError = "Грешка при създаване на плащането";

        if (result.error) {
          if (result.error.includes("Insufficient stock")) {
            bulgarianError =
              "Недостатъчно количество в склада. Моля, намалете количеството или изберете друг продукт.";
          } else if (result.error.includes("Product variant not found")) {
            bulgarianError =
              "Избраният размер не е наличен. Моля, изберете друг размер.";
          } else if (result.error.includes("Missing required Stripe")) {
            bulgarianError =
              "Системна грешка при конфигурацията на плащането. Моля, свържете се с поддръжката.";
          } else {
            bulgarianError = `Грешка: ${result.error}`;
          }
        }

        throw new Error(bulgarianError);
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Карта елементът не е намерен");
      }

      const { error: paymentError, paymentIntent } =
        await stripe.confirmCardPayment(result.paymentIntent.client_secret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: form.name,
              email: form.email,
              phone: form.phone,
              address: {
                line1: form.address,
                city: form.city,
                state:
                  bulgarianRegions.find((r) => r.value === form.region)
                    ?.label || form.region,
                country: "BG",
              },
            },
          },
        });

      if (paymentError) {
        // Translate common Stripe error messages to Bulgarian
        let bulgarianError = "Грешка при плащането";

        if (paymentError.code === "card_declined") {
          bulgarianError =
            "Картата е отхвърлена. Моля, опитайте с друга карта.";
        } else if (paymentError.code === "expired_card") {
          bulgarianError =
            "Картата е изтекла. Моля, използвайте валидна карта.";
        } else if (paymentError.code === "incorrect_cvc") {
          bulgarianError =
            "CVC кодът е неправилен. Моля, проверете и опитайте отново.";
        } else if (paymentError.code === "insufficient_funds") {
          bulgarianError = "Недостатъчни средства в картата.";
        } else if (paymentError.code === "invalid_number") {
          bulgarianError = "Номерът на картата е неправилен.";
        } else if (paymentError.code === "processing_error") {
          bulgarianError =
            "Възникна грешка при обработката. Моля, опитайте отново.";
        } else if (paymentError.code === "authentication_required") {
          bulgarianError =
            "Изисква се допълнително удостоверяване. Моля, довършете процеса.";
        } else if (paymentError.message) {
          // For other errors, use the original message but add context
          bulgarianError = `Грешка при плащането: ${paymentError.message}`;
        }

        throw new Error(bulgarianError);
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Call our API to confirm the order and update inventory
        try {
          const confirmResponse = await fetch(
            `/api/stripe?payment_intent_id=${paymentIntent.id}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (confirmResponse.ok) {
            console.log(
              "✅ Поръчката е потвърдена и количествата са актуализирани"
            );

            // Trigger browser storage event to refresh product data
            window.dispatchEvent(new CustomEvent("inventoryUpdated"));
          } else {
            console.warn("⚠️ Грешка при актуализация на количествата");
          }
        } catch (confirmError) {
          console.warn(
            "⚠️ Плащането е успешно, но актуализацията на количествата може да е неуспешна:",
            confirmError
          );
        }

        setSuccess(true);
        // Clear cart
        localStorage.removeItem("insomnia_cart");

        // Trigger cart update event for navbar
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        // Redirect to clothes page after 3 seconds to see updated inventory
        setTimeout(() => {
          window.location.href = "/clothes";
        }, 3000);
      }
    } catch (e) {
      // Enhanced error handling with Bulgarian messages
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(
          "Възникна неочаквана грешка при плащането. Моля, опитайте отново или се свържете с поддръжката."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black py-16 px-4">
        <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-10 text-center">
          <div className="text-green-400 text-6xl mb-4">✅</div>
          <div className="text-white text-xl mb-4">
            Плащането е успешно! Поръчката е потвърдена.
          </div>
          <div className="text-gray-300 mb-6">
            Ще получите имейл с потвърждение на адреса {form.email}
            <br />
            <br />
            Количествата на продуктите са автоматично актуализирани.
            <br />
            След 3 секунди ще бъдете пренасочени към продуктите.
          </div>
          <Link
            href="/clothes"
            className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Продължете с пазаруването
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Плащане</h1>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10">
            <div className="text-gray-300 mb-6">Количката е празна</div>
            <Link
              href="/clothes"
              className="inline-block px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Разгледайте продуктите
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Плащане</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Вашата поръчка
            </h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-white">{item.product_name}</div>
                    <div className="text-gray-400 text-sm">
                      Размер: {item.size} | Количество: {item.quantity}
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold">
                    {((item.product_price || 0) * item.quantity).toFixed(2)} лв.
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Общо:</span>
                  <span className="text-purple-400">
                    {total.toFixed(2)} лв.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Данни за плащане
            </h2>

            {/* Auto-fill notification */}
            {isLoggedIn && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="text-green-400 text-sm">
                  ✅ Данните са автоматично попълнени от вашия акаунт
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm text-gray-300 mb-2"
                    htmlFor="name"
                  >
                    Име и фамилия
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Въведете вашето име и фамилия"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-gray-300 mb-2"
                    htmlFor="email"
                  >
                    Имейл
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-gray-300 mb-2"
                    htmlFor="phone"
                  >
                    Телефон
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="0888 123 456"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm text-gray-300 mb-2"
                    htmlFor="region"
                  >
                    Област *
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={form.region}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {bulgarianRegions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm text-gray-300 mb-2"
                    htmlFor="city"
                  >
                    Град / Населено място *
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="Въведете град или населено място"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
                    list="cities-list"
                  />
                  <datalist id="cities-list">
                    {availableCities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                  {form.region && availableCities.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Популярни градове:{" "}
                      {availableCities.slice(0, 5).join(", ")}
                      {availableCities.length > 5 && "..."}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm text-gray-300 mb-2"
                    htmlFor="address"
                  >
                    Адрес за доставка *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="ул. Витоша 1, ет. 2, ап. 5, пк. 1000"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400"
                  />
                </div>

                {/* Stripe Card Element */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Данни за картата
                  </label>
                  <div className="rounded-lg bg-gray-800 border border-gray-700 p-4">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#ffffff",
                            backgroundColor: "#1f2937",
                            "::placeholder": {
                              color: "#9ca3af",
                            },
                          },
                          invalid: {
                            color: "#f87171",
                          },
                        },
                        hidePostalCode: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <div className="text-red-400">{error}</div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/cart"
                  className="flex-1 text-center px-6 py-3 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
                >
                  Назад към количката
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !stripe}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:from-purple-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Обработка..."
                    : `Плати ${total.toFixed(2)} лв.`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export component wrapped with Stripe Elements
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
