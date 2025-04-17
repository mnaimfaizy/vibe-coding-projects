import { useState } from "react";
import { toast } from "react-toastify";
import { createReview, updateReview } from "../../services/reviewService";
import { useAppDispatch } from "../../store/hooks";
import { StarRating } from "../ui/StarRating";

interface ReviewFormProps {
  bookId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  };
  onReviewSubmitted?: () => void;
}

export const ReviewFormComponent = ({
  bookId,
  existingReview,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        await updateReview(existingReview.id, { rating, comment });
        toast.success("Review updated successfully");
      } else {
        await createReview(bookId, { rating, comment });
        toast.success("Review submitted successfully");
      }

      // Reset form if it's a new review
      if (!existingReview) {
        setRating(0);
        setComment("");
      }

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
        role="form"
        aria-label="review form"
      >
        <div>
          <label className="block mb-1">Rating</label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        <div>
          <label htmlFor="comment" className="block mb-1">
            Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border rounded"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "Submitting..."
            : existingReview
            ? "Update Review"
            : "Submit Review"}
        </button>
      </form>
    </div>
  );
};
