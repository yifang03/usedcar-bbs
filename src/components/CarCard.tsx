import Link from "next/link";

interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  images: string;
  createdAt: string;
}

export default function CarCard({ car }: { car: Car }) {
  let images: string[] = [];
  try { images = JSON.parse(car.images); } catch {}

  return (
    <Link href={`/cars/${car.id}`} className="card-hover surface mb-3 block overflow-hidden rounded-xl">
      <div className="flex">
        {images[0] ? (
          <div className="h-[7.25rem] w-[7.25rem] shrink-0">
            <img src={images[0]} alt={car.title} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-[7.25rem] w-[7.25rem] shrink-0 items-center justify-center bg-primary-light text-sm font-medium text-primary">
            无图片
          </div>
        )}
        <div className="min-w-0 flex-1 p-3">
          <h3 className="truncate text-sm font-semibold text-text">{car.title}</h3>
          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-text-secondary">
            <span>{car.year}年</span>
            <span>{car.mileage}万公里</span>
            <span>{car.city}</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <span className="text-lg font-bold leading-none text-danger">
              ¥{car.price.toLocaleString()}
              <span className="ml-0.5 text-xs font-medium">万</span>
            </span>
            <span className="shrink-0 text-xs text-text-secondary">{new Date(car.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
