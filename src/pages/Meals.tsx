import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Meal {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  onDiet: boolean;
  calories?: number;
}

interface DailyMeals {
  date: Date;
  meals: Meal[];
}

export default function Meals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<DailyMeals[]>([]);
  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id'>>({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    onDiet: true,
    calories: 0,
  });

  useEffect(() => {
    // Inicializa a semana atual
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Começa na segunda-feira
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const initialWeeklyMeals = weekDays.map(date => ({
      date,
      meals: [],
    }));

    setWeeklyMeals(initialWeeklyMeals);
  }, []);

  useEffect(() => {
    // Atualiza a visualização semanal quando as refeições mudam
    setWeeklyMeals(prev =>
      prev.map(day => ({
        ...day,
        meals: meals.filter(meal =>
          isSameDay(new Date(meal.date), day.date)
        ).sort((a, b) => a.time.localeCompare(b.time))
      }))
    );
  }, [meals]);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const meal: Meal = {
      id: crypto.randomUUID(),
      ...newMeal,
    };
    setMeals([...meals, meal]);
    setNewMeal({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      onDiet: true,
      calories: 0,
    });
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Minhas Refeições</h1>

      {/* Formulário de adição */}
      <form onSubmit={handleAddMeal} className="mb-8 bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Nome da Refeição</label>
            <input
              type="text"
              value={newMeal.name}
              onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Descrição</label>
            <input
              type="text"
              value={newMeal.description}
              onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Data</label>
            <input
              type="date"
              value={newMeal.date}
              onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Horário</label>
            <input
              type="time"
              value={newMeal.time}
              onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Calorias</label>
            <input
              type="number"
              value={newMeal.calories}
              onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Dentro da Dieta</label>
            <input
              type="checkbox"
              checked={newMeal.onDiet}
              onChange={(e) => setNewMeal({ ...newMeal, onDiet: e.target.checked })}
              className="mt-1 block rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Adicionar Refeição
        </button>
      </form>

      {/* Visualização Semanal */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-7 gap-4 p-4">
          {weeklyMeals.map((day) => (
            <div key={day.date.toISOString()} className="flex flex-col">
              <div className="text-center font-medium text-gray-300 mb-2">
                {format(day.date, 'EEE', { locale: ptBR })}
                <br />
                {format(day.date, 'dd/MM')}
              </div>
              <div className="flex-1 min-h-[200px] bg-gray-700 rounded-lg p-2">
                {day.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`mb-2 p-2 rounded ${meal.onDiet ? 'bg-green-800' : 'bg-red-800'
                      }`}
                  >
                    <div className="text-sm font-medium text-white">{meal.name}</div>
                    <div className="text-xs text-gray-300">{meal.time}</div>
                    <div className="text-xs text-gray-300">{meal.calories} kcal</div>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="mt-1 text-xs text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
