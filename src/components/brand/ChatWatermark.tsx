export function ChatWatermark() {
  return (
    <div className="chat-watermark" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 540"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
      >
        <path
          d="M490 540L640 310C675 256 725 225 790 225H920V295H800C758 295 724 316 699 354L578 540H490Z"
          fill="#E5DCFF"
          opacity="0.58"
        />
        <path
          d="M540 245C562 120 645 55 775 55H920V132H780C695 132 645 170 626 245H540Z"
          fill="#E5DCFF"
          opacity="0.52"
        />
        <path
          d="M785 540L852 442C866 422 886 412 912 412H935V462H910C896 462 886 468 878 480L837 540H785Z"
          fill="#F4B400"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}
