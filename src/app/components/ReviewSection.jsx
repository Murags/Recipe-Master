// Example placeholder data for reviews
const reviews = [
    {
      name: "David Johnson",
      date: "June 12, 2022",
      rating: 5,
      feedback: "I was impressed with the quality of service I received from Trim. The barber was professional, friendly, and did an excellent job. I'll definitely be using this app again.",
    },
    {
      name: "Sarah Thompson",
      date: "July 5, 2022",
      rating: 5,
      feedback: "I had a great experience with Trim. The barber arrived on time, was very skilled, and gave me a fantastic haircut. The convenience of having a barber come to my home was a game-changer.",
    },
    {
      name: "Michael Davis",
      date: "August 20, 2022",
      rating: 5,
      feedback: "Trim provided an excellent service. The barber was punctual and delivered exactly what I wanted. Highly recommend this app!",
    },
  ];

  // Star component for reusability
  const StarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20px"
      height="20px"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path
        d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
      ></path>
    </svg>
  );

  const ReviewCard = ({ name, date, rating, feedback }) => (
    <div className="flex flex-col gap-3 bg-[#fcfaf8]">
      <div className="flex-1">
        <p className="text-[#1b130d] text-base font-medium leading-normal">{name}</p>
        <p className="text-[#9a6e4c] text-sm font-normal leading-normal">{date}</p>
      </div>
      <div className="flex gap-0.5">
        {/* Generate stars based on rating */}
        {[...Array(rating)].map((_, index) => (
          <div className="text-[#ee7f2b]" key={index}>
            <StarIcon />
          </div>
        ))}
      </div>
      <p className="text-[#1b130d] text-base font-normal leading-normal">{feedback}</p>
    </div>
  );

  const ReviewsSection = () => (
    <div className="flex flex-col gap-8 overflow-x-hidden bg-[#fcfaf8] p-4">
      <h2 className="text-[#111318] text-lg text-[24px] font-bold leading-tight pb-2 pt-4">
        What Reviewers are Saying
      </h2>
      {reviews.map((review, index) => (
        <ReviewCard key={index} {...review} />
      ))}
    </div>
  );

  export default ReviewsSection;
