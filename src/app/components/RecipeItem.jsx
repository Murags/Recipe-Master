import Link from 'next/link';

const RecipeItem = ({ id, imageUrl, title, rating, reviews }) => {
  return (
    <Link href={`/recipes/${id}`} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]">
      <div className="flex flex-col gap-3 pb-3 cursor-pointer">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
        <div>
          <p className="text-[#111318] text-base font-medium leading-normal">{title}</p>
          <p className="text-[#9a6e4c] text-sm font-normal leading-normal">{rating} ({reviews} reviews)</p>
        </div>
      </div>
    </Link>
  );
};

export default RecipeItem;
