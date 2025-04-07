import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, addWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateWeeklyMeals } from '../utils/mockData';

interface Meal {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  onDiet: boolean;
  on_diet?: number;
  calories?: number;
}

interface DailyMeals {
  date: Date;
  meals: Meal[];
}

interface MealModification {
  id: string;
  type: 'create' | 'update' | 'delete';
  meal: Meal;
  timestamp: Date;
}

export default function Home() {
  const { user, signOut, deleteAccount, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<DailyMeals[]>([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [modificationHistory, setModificationHistory] = useState<MealModification[]>([]);
  const [showModificationHistory, setShowModificationHistory] = useState(false);
  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id'>>({
    name: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    onDiet: true,
    calories: undefined,
  });
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError('');
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao deletar conta. Tente novamente.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Verificar se a data é futura
      const selectedDate = new Date(newMeal.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetar horas para comparar apenas as datas

      if (selectedDate > today) {
        alert('Não é possível adicionar refeições para datas futuras.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newMeal.name,
          description: newMeal.description,
          date: newMeal.date,
          time: newMeal.time,
          onDiet: Boolean(newMeal.onDiet),
          calories: newMeal.calories || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add meal');
      }

      const data = await response.json();
      const newMealData = data.meal;

      // Atualiza o estado meals
      setMeals(prevMeals => [...prevMeals, newMealData]);

      // Atualiza o estado weeklyMeals
      setWeeklyMeals(prevWeeklyMeals => {
        const updatedWeeklyMeals = prevWeeklyMeals.map(day => {
          const dayDate = format(day.date, 'yyyy-MM-dd');
          const mealDate = newMealData.date.split('T')[0];

          if (dayDate === mealDate) {
            const updatedMeals = [...day.meals, newMealData].sort((a, b) => {
              // Primeiro compara por data
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              // Se a data for igual, compara por hora
              return a.time.localeCompare(b.time);
            });

            return {
              ...day,
              meals: updatedMeals
            };
          }
          return day;
        });

        return updatedWeeklyMeals;
      });

      setShowAddMealModal(false);
      setNewMeal({
        name: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        onDiet: false,
        calories: undefined,
      });
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Erro ao adicionar refeição. Tente novamente.');
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setNewMeal({
      name: meal.name,
      description: meal.description,
      date: meal.date,
      time: meal.time,
      onDiet: meal.onDiet,
      calories: meal.calories || 0,
    });
    setShowAddMealModal(true);
  };

  const handleUpdateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeal) return;

    try {
      // Verificar se a data é futura
      const selectedDate = new Date(newMeal.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetar horas para comparar apenas as datas

      if (selectedDate > today) {
        alert('Não é possível adicionar refeições para datas futuras.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/meals/${selectedMeal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newMeal.name,
          description: newMeal.description,
          date: newMeal.date,
          time: newMeal.time,
          onDiet: newMeal.onDiet,
          calories: newMeal.calories || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meal');
      }

      const data = await response.json();
      setMeals(meals.map((m) => (m.id === selectedMeal.id ? data.meal : m)));
      setShowAddMealModal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  const handleDeleteMeal = async (meal: Meal) => {
    try {
      // Deleta a refeição na API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/meals/${meal.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar refeição');
      }

      // Remove do estado de meals
      setMeals(prevMeals => prevMeals.filter(m => m.id !== meal.id));

      // Remove do estado de weeklyMeals
      setWeeklyMeals(prevWeeklyMeals =>
        prevWeeklyMeals.map(day => ({
          ...day,
          meals: day.meals.filter(m => m.id !== meal.id)
        }))
      );

      // Adiciona ao histórico local
      setModificationHistory(prev => [...prev, {
        id: crypto.randomUUID(),
        type: 'delete',
        meal,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Erro ao deletar refeição:', error);
      alert('Erro ao deletar refeição. Tente novamente.');
    }
  };

  const handleOpenAddMealModal = (date: Date) => {
    setSelectedDate(date);
    // Usando a data exata que foi passada para o modal
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log('Data selecionada:', formattedDate); // Para debug
    setNewMeal({
      name: '',
      description: '',
      date: formattedDate,
      time: format(new Date(), 'HH:mm'),
      onDiet: true,
      calories: undefined,
    });
    setShowAddMealModal(true);
  };

  const loadMealsForWeek = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/meals`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load meals');
      }

      const data = await response.json();

      // Mapeia as refeições para garantir que onDiet esteja definido corretamente
      const mappedMeals = data.meals.map((meal: any) => ({
        ...meal,
        onDiet: meal.onDiet || meal.on_diet === 1
      }));

      setMeals(mappedMeals);

      // Organiza as refeições por semana
      const today = new Date();
      const startOfCurrentWeek = startOfWeek(addWeeks(today, currentWeekOffset), { weekStartsOn: 0 });
      const endOfWeek = addDays(startOfCurrentWeek, 6);

      const daysOfWeek = [...Array(7)].map((_, i) => {
        const date = addDays(startOfCurrentWeek, i);
        const formattedDate = format(date, 'yyyy-MM-dd');

        // Filtra as refeições para este dia - converte a data da API para o formato correto
        const mealsForDay = mappedMeals.filter((meal: any) => {
          // A data da API vem no formato "2025-04-08T00:00:00.000Z"
          // Precisamos converter para "2025-04-08" para comparação
          const mealDate = meal.date.split('T')[0];
          return mealDate === formattedDate;
        });

        return {
          date,
          formattedDate,
          meals: mealsForDay.sort((a: any, b: any) => a.time.localeCompare(b.time)),
        };
      });

      setWeeklyMeals(daysOfWeek);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
      alert('Erro ao carregar refeições. Não foi possível carregar suas refeições. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [currentWeekOffset]);

  // Carrega as refeições ao montar o componente e quando mudar a semana
  useEffect(() => {
    loadMealsForWeek();
  }, [loadMealsForWeek]);

  // Adicionar a função helper para verificar se a data é futura
  const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-star-dust-950 flex items-center justify-center">
        <div className="text-star-dust-50 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-star-dust-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-star-dust-50">
            Daily Diet
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Deletar Conta
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-star-dust-600 text-white rounded-md hover:bg-star-dust-700 focus:outline-none focus:ring-2 focus:ring-star-dust-500"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="bg-star-dust-900 rounded-lg p-6 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-star-dust-700 flex items-center justify-center">
                <span className="text-2xl text-star-dust-300">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-star-dust-50">
                Olá, {user.firstName}! 👋
              </h2>
              <p className="text-star-dust-400">Que bom ter você por aqui!</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl text-star-dust-300">
              Vamos começar a cuidar da sua alimentação?
            </p>
            <p className="text-star-dust-400">
              Aqui você pode registrar suas refeições diárias, acompanhar sua dieta e manter um estilo de vida saudável.
            </p>
          </div>
        </div>

        <div className="bg-star-dust-900 rounded-lg p-4 shadow-lg mb-6">
          <div className="flex space-x-4 mb-6 border-b border-star-dust-700">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'grid'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-star-dust-400 hover:text-star-dust-300'
                }`}
            >
              Visualização em Grid
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'list'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-star-dust-400 hover:text-star-dust-300'
                }`}
            >
              Lista de Refeições
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'calendar'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-star-dust-400 hover:text-star-dust-300'
                }`}
            >
              Calendário
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'grid' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-star-dust-300">
                      Suas Refeições da Semana
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                        className="p-1 text-star-dust-400 hover:text-star-dust-300 transition-colors"
                        title="Semana anterior"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentWeekOffset(0)}
                        className="px-2 py-1 text-sm text-star-dust-400 hover:text-star-dust-300 bg-star-dust-800/70 rounded transition-colors"
                        title="Voltar para semana atual"
                      >
                        Hoje
                      </button>
                      <button
                        onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                        className={`p-1 transition-colors ${currentWeekOffset >= 0
                          ? 'text-star-dust-700 cursor-not-allowed'
                          : 'text-star-dust-400 hover:text-star-dust-300'}`}
                        title="Próxima semana"
                        disabled={currentWeekOffset >= 0}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <span className="text-sm text-star-dust-400 ml-2">
                        {format(startOfWeek(addWeeks(new Date(), currentWeekOffset), { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })}
                        {' - '}
                        {format(addDays(startOfWeek(addWeeks(new Date(), currentWeekOffset), { weekStartsOn: 0 }), 6), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadMealsForWeek()}
                      className="text-sm text-star-dust-400 hover:text-star-dust-300"
                    >
                      Atualizar
                    </button>
                    <button
                      onClick={() => {
                        const testMeals = generateWeeklyMeals();
                        setMeals(testMeals);

                        // Organize meals by week
                        const today = new Date();
                        const startOfCurrentWeek = startOfWeek(addWeeks(today, currentWeekOffset), { weekStartsOn: 0 });
                        const endOfWeek = addDays(startOfCurrentWeek, 6);

                        const daysOfWeek = [...Array(7)].map((_, i) => {
                          const date = addDays(startOfCurrentWeek, i);
                          const formattedDate = format(date, 'yyyy-MM-dd');

                          // Filtra as refeições para este dia usando a mesma lógica do loadMealsForWeek
                          const mealsForDay = testMeals.filter(meal => {
                            return meal.date === formattedDate;
                          });

                          return {
                            date,
                            formattedDate,
                            meals: mealsForDay.sort((a, b) => a.time.localeCompare(b.time)),
                          };
                        });

                        setWeeklyMeals(daysOfWeek);
                      }}
                      className="text-sm text-star-dust-400 hover:text-star-dust-300 bg-star-dust-800 px-3 py-1 rounded transition-colors"
                    >
                      Gerar Dados de Teste
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-4 px-1">
                  {weeklyMeals.map((day, index) => {
                    const date = day.date;
                    const formattedDayDate = format(date, 'yyyy-MM-dd');

                    return (
                      <div key={index} className="bg-star-dust-800 p-4 rounded-lg min-h-[280px] flex flex-col w-[calc(100%+10%)] -mx-2">
                        <div className="text-center text-star-dust-300 mb-4 pb-2 border-b border-star-dust-700">
                          <span className="text-lg font-medium">{format(date, 'EEE', { locale: ptBR })}</span>
                          <br />
                          <span className="text-sm">{format(date, 'dd/MM')}</span>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-400px)] pr-1">
                          {day.meals.length > 0 ? (
                            day.meals.map(meal => (
                              <div
                                key={meal.id}
                                className={`p-3 rounded ${meal.onDiet || meal.on_diet === 1 ? 'bg-green-900/30' : 'bg-red-900/30'} hover:bg-opacity-50 transition-colors group relative flex flex-col`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="min-w-0 flex-1 pr-2">
                                    <div className="text-sm text-star-dust-200 font-medium leading-snug line-clamp-2">{meal.name}</div>
                                  </div>
                                  <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{
                                    backgroundColor: meal.onDiet || meal.on_diet === 1 ? 'rgb(34 197 94)' : 'rgb(239 68 68)'
                                  }}></div>
                                </div>

                                <div className="text-xs text-star-dust-400 line-clamp-2 mb-2">{meal.description}</div>

                                <div className="flex items-center gap-3 text-xs text-star-dust-400">
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {meal.time}
                                  </div>
                                  {meal.calories && (
                                    <div className="flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                      {meal.calories} kcal
                                    </div>
                                  )}
                                </div>

                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                  <button
                                    onClick={() => handleEditMeal(meal)}
                                    className="p-1 text-star-dust-400 hover:text-star-dust-200 transition-colors"
                                    title="Editar refeição"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMeal(meal)}
                                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                    title="Excluir refeição"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex-1 flex items-center justify-center">
                              {!isFutureDate(date) && (
                                <button
                                  onClick={() => handleOpenAddMealModal(date)}
                                  className="w-full h-full min-h-[100px] flex items-center justify-center text-star-dust-500 hover:text-star-dust-400 rounded transition-colors"
                                >
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {day.meals.length > 0 && !isFutureDate(date) && (
                          <button
                            onClick={() => handleOpenAddMealModal(date)}
                            className="mt-3 w-full py-2 text-sm text-star-dust-400 hover:text-star-dust-300 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Adicionar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="space-y-4">
                <div className="bg-star-dust-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-star-dust-300 font-medium">Café da manhã</div>
                      <div className="text-star-dust-400 text-sm">08:00 - 400 kcal</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-star-dust-400 text-sm">Na dieta</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-star-dust-800 p-2 rounded-lg flex flex-col items-center justify-center"
                  >
                    <div className="text-star-dust-300 text-sm">
                      {format(addDays(startOfWeek(new Date()), index), 'd')}
                    </div>
                    <div className="mt-1 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de adicionar/editar refeição */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-star-dust-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-star-dust-100 mb-4">
              {selectedMeal ? 'Editar Refeição' : 'Adicionar Refeição'}
            </h2>
            <p className="text-sm text-star-dust-300 mb-4">
              {selectedMeal
                ? `Data: ${format(new Date(selectedMeal.date), 'dd/MM/yyyy')}`
                : `Data: ${format(selectedDate || new Date(), 'dd/MM/yyyy')} (${format(selectedDate || new Date(), 'EEEE', { locale: ptBR })})`}
            </p>
            <form onSubmit={selectedMeal ? handleUpdateMeal : handleAddMeal} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-star-dust-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-star-dust-700 text-star-dust-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-star-dust-300 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={newMeal.description}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-star-dust-700 text-star-dust-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-star-dust-300 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={newMeal.date}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-star-dust-700 text-star-dust-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-star-dust-300 mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={newMeal.time}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-star-dust-700 text-star-dust-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-star-dust-300 mb-1">
                  Calorias
                </label>
                <input
                  type="number"
                  id="calories"
                  value={newMeal.calories || ''}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-star-dust-700 text-star-dust-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onDiet"
                  checked={newMeal.onDiet}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, onDiet: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-star-dust-700 border-star-dust-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="onDiet" className="ml-2 text-sm font-medium text-star-dust-300">
                  Está dentro da dieta?
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMealModal(false);
                    setSelectedMeal(null);
                    setNewMeal({
                      name: '',
                      description: '',
                      date: format(new Date(), 'yyyy-MM-dd'),
                      time: format(new Date(), 'HH:mm'),
                      onDiet: true,
                      calories: undefined,
                    });
                  }}
                  className="px-4 py-2 text-star-dust-400 hover:text-star-dust-300 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedMeal ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modification History - Discreto */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowModificationHistory(prev => !prev)}
          className="bg-star-dust-800/70 text-star-dust-400 hover:text-star-dust-300 p-2 rounded-full shadow-lg hover:bg-star-dust-700 transition-colors"
          title="Histórico de Modificações"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {showModificationHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-star-dust-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-star-dust-50">
                Histórico de Modificações
              </h3>
              <button
                onClick={() => setShowModificationHistory(false)}
                className="text-star-dust-400 hover:text-star-dust-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {modificationHistory.map(modification => (
                <div
                  key={modification.id}
                  className="bg-star-dust-800 p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <span className="text-star-dust-300">
                      {modification.type === 'create' && '➕ Criada'}
                      {modification.type === 'update' && '✏️ Atualizada'}
                      {modification.type === 'delete' && '🗑️ Deletada'}
                    </span>
                    <span className="text-star-dust-400 ml-2">
                      {modification.meal.name} - {format(new Date(modification.meal.date), 'dd/MM/yyyy')} {modification.meal.time}
                    </span>
                  </div>
                  <span className="text-star-dust-400 text-sm">
                    {format(modification.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-star-dust-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-star-dust-50 mb-4">
              Tem certeza que deseja deletar sua conta?
            </h3>
            <p className="text-star-dust-400 mb-6">
              Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-star-dust-700 text-white rounded-md hover:bg-star-dust-600 focus:outline-none focus:ring-2 focus:ring-star-dust-500"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deletando...' : 'Sim, deletar conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
