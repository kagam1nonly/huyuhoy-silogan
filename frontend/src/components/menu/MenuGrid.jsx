import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'

export default function MenuGrid({ meals, onAddToCart }) {
  const [selectedMeal, setSelectedMeal] = useState(null)

  function handleAdd(meal, riceLabel) {
    onAddToCart(meal, riceLabel)
    toast.success(`${meal.name} added to cart`, {
      description: riceLabel === 'with rice' ? 'With rice selected' : 'Without rice selected',
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {meals.map((meal) => (
        <Card key={meal.meal_id} className="overflow-hidden">
          <CardHeader className="p-0">
            <img
              src={meal.pImage}
              alt={meal.name}
              className="h-44 w-full bg-white object-contain p-4"
              onError={(event) => {
                event.currentTarget.src = '/assets/huyuhoy-logo.jpg'
              }}
            />
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <CardTitle className="text-base">{meal.name}</CardTitle>
            <div className="space-y-1 text-sm text-slate-600">
              <p>With rice: <span className="font-semibold text-slate-900">₱{meal.withRice}</span></p>
              <p>Without rice: <span className="font-semibold text-slate-900">₱{meal.withOutRice}</span></p>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedMeal(meal)}>
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedMeal?.name ?? meal.name}</DialogTitle>
                  <DialogDescription>Choose your preferred serving option.</DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p>With rice: <span className="font-semibold text-slate-900">₱{selectedMeal?.withRice ?? meal.withRice}</span></p>
                  <p>Without rice: <span className="font-semibold text-slate-900">₱{selectedMeal?.withOutRice ?? meal.withOutRice}</span></p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => handleAdd(meal, 'without rice')}>
                    Add (No Rice)
                  </Button>
                  <Button type="button" onClick={() => handleAdd(meal, 'with rice')}>
                    Add (With Rice)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="button" onClick={() => handleAdd(meal, 'with rice')}>
              Add
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
