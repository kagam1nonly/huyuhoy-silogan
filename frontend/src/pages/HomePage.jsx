import { ArrowDownCircle, CircleHelp, Flame, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchMeals } from '../api/client'
import ImageWithFallback from '../components/ImageWithFallback'
import MenuGrid from '../components/menu/MenuGrid'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

export default function HomePage({ onAddToCart }) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadMeals() {
      try {
        setLoading(true)
        const data = await fetchMeals()
        if (mounted) {
          setMeals(data)
          setError('')
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadMeals()

    return () => {
      mounted = false
    }
  }, [])

  const featuredMeals = meals.slice(0, 5)
  const sideHighlights = meals.slice(0, 4)
  const spotlightMeal = featuredMeals[0] ?? meals[0]

  if (loading) {
    return <LoadingState text="Loading meals..." />
  }

  if (error) {
    return <ErrorState text={error} />
  }

  if (!meals.length) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Menu is currently empty</h1>
          <p className="mt-2 text-base text-slate-600">No meals are published yet. Add items from the admin meals panel.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-orb -left-36 top-24 h-56 w-56 md:h-72 md:w-72" />
        <div className="hero-orb -right-40 top-56 h-64 w-64 md:h-80 md:w-80" />
      </div>

      <section className="border-b border-slate-200 bg-linear-to-b from-[#f8fafc] via-[#f9fafb] to-white">
        <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-center lg:py-10">
          <div className="w-full lg:w-3/5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1b2132]/15 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#1b2132] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#f4c23d]" />
              Fresh off the pan
            </div>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {featuredMeals.map((meal) => (
                  <CarouselItem key={meal.meal_id}>
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_20px_50px_-30px_rgba(27,33,50,0.5)]">
                      <div className="relative flex h-[58vh] min-h-90 w-full items-center justify-center bg-white p-4">
                        <div className="pointer-events-none absolute -right-1 -top-1 z-10 flex flex-col items-end">
                          {meal.isHot ? (
                            <span className="corner-hot-badge corner-hot-badge--angled" aria-label="Hot meal" title="Hot meal">
                              <span>HOT</span>
                            </span>
                          ) : null}
                        </div>
                        <ImageWithFallback
                          src={meal.pImage}
                          alt={meal.name}
                          wrapperClassName="h-full w-full"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="border-t bg-[#1b2132]/95 px-4 py-3 text-white">
                        <p className="text-xl font-bold tracking-tight">{meal.name}</p>
                        <p className="mt-1 text-sm text-balance">With unli-rice ₱{meal.withUnliRice} · Without unli ₱{meal.withoutUnli}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </Carousel>
          </div>

          <div className="w-full lg:w-2/5">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.7)] md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Our Best Selling Meal</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">{spotlightMeal?.name ?? 'Sisig'}</h1>
              <p className="mt-3 text-base text-slate-600">
                Bold flavor, sizzling aroma, and made fresh daily. Perfect for quick cravings and group orders.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="menu-chip">
                  <Flame className="h-3.5 w-3.5" />
                  Freshly Cooked
                </span>
                <span className="menu-chip">
                  <Sparkles className="h-3.5 w-3.5" />
                  Unlimited Rice
                </span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">More crowd favorites</p>
                <ul className="mt-3 space-y-2">
                  {sideHighlights.map((meal) => (
                    <li key={meal.meal_id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
                      {meal.name}
                      {meal.isHot ? ' 🔥' : ''}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 rounded-xl bg-[#1b2132]/95 px-4 py-3 text-white">
                <p className="text-sm font-medium">{meals.length} menu items available</p>
              </div>

              <a
                href="#menu"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#1b2132]/20 bg-[#1b2132]/5 px-3 py-2 text-sm font-semibold text-[#1b2132] transition-colors hover:bg-[#1b2132]/10"
              >
                Explore menu
                <ArrowDownCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="food-order-surface mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-linear-to-r from-white to-[#fff9ea] p-6 shadow-sm md:p-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Freshly cooked daily</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Build your order from the menu</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Pick your favorite silog meals, customize rice options, and check out quickly.
            </p>
          </div>
          <div className="rounded-xl bg-[#1b2132]/95 px-4 py-3 text-white">
            <p className="text-sm font-medium">{meals.length} menu items available</p>
          </div>
        </div>
        </div>

        <section id="menu" className="scroll-mt-28">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Menu</h2>
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                  How pricing works
                  <CircleHelp className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Choose with unli-rice or without unli before adding to cart.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <MenuGrid meals={meals} onAddToCart={onAddToCart} />
        </section>
      </section>
    </main>
  )
}
