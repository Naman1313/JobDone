import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = [
  { name: 'Electrician', icon: '⚡' },
  { name: 'Plumber', icon: '🔧' },
  { name: 'Painter', icon: '🎨' },
  { name: 'Carpenter', icon: '🪵' },
  { name: 'Welder', icon: '🔥' },
  { name: 'Mechanic', icon: '⚙️' },
  { name: 'Driver', icon: '🚗' },
  { name: 'Cook', icon: '🍳' },
  { name: 'Tailor', icon: '✂️' },
  { name: 'Developer', icon: '💻' },
  { name: 'Designer', icon: '🎨' },
  { name: 'Photographer', icon: '📸' },
  { name: 'Videographer', icon: '🎥' },
  { name: 'Civil Engineer', icon: '🏗️' },
  { name: 'Architect', icon: '📐' },
  { name: 'Interior Designer', icon: '🛋️' },
  { name: 'Teacher', icon: '📚' },
  { name: 'Doctor', icon: '🩺' },
  { name: 'Lawyer', icon: '⚖️' },
  { name: 'Digital Marketing', icon: '📱' },
  { name: 'Beautician', icon: '💅' },
  { name: 'Fitness Trainer', icon: '💪' },
  { name: 'AC Technician', icon: '❄️' },
  { name: 'Mobile Repair', icon: '📱' },
  { name: 'Construction', icon: '🏗️' },
  { name: 'Manufacturing', icon: '🏭' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Education', icon: '🎓' },
  { name: 'Agriculture', icon: '🌾' },
  { name: 'Home Services', icon: '🧹' }
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    if (categories.length === 0) {
      // Seed default categories
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES
      });
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
