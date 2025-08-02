'use client'

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import { Star, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from 'sonner';
import gsap from 'gsap';

interface Rating {
  _id: string;
  _type: 'rating';
  productId: string;
  userId: string;
  value: number;
  createdAt: string;
}

interface Feedback {
  _id: string;
  _type: 'feedback';
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface ProductFeedbackProps {
  productId: string;
  initialRating?: number;
  initialFeedbacks?: Feedback[];
}

export function ProductFeedbackSection({ 
  productId, 
  initialRating = 0, 
  initialFeedbacks = [] 
}: ProductFeedbackProps) {
  const { user, isSignedIn } = useUser();
  const [rating, setRating] = useState(initialRating);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  // Fetch ratings and feedback on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product rating
        const product = await client.fetch(
          `*[_type == "product" && _id == $productId][0]{
            rating
          }`,
          { productId }
        );
        
        if (product?.rating) {
          setRating(product.rating);
        }

        // Fetch user's rating if signed in
        if (isSignedIn && user) {
          const userRatingDoc = await client.fetch(
            `*[_type == "rating" && productId == $productId && userId == $userId][0]{
              value
            }`,
            { productId, userId: user.id }
          );
          
          if (userRatingDoc) {
            setUserRating(userRatingDoc.value);
          }
        }

        // Fetch feedbacks
        const feedbacks = await client.fetch(
          `*[_type == "feedback" && productId == $productId] | order(_createdAt desc)`,
          { productId }
        );
        
        setFeedbacks(feedbacks);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      }
    };

    fetchData();
  }, [productId, isSignedIn, user]);

  const handleRateProduct = async (value: number) => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to rate products',
        variant: 'default',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if user already rated this product
      const existingRating = await client.fetch(
        `*[_type == "rating" && productId == $productId && userId == $userId][0]`,
        { productId, userId: user?.id }
      );

      if (existingRating) {
        // Update existing rating
        await client
          .patch(existingRating._id)
          .set({ value })
          .commit();
      } else {
        // Create new rating
        await client.create({
          _type: 'rating',
          productId,
          userId: user?.id,
          value,
        });
      }

      // Calculate new average rating
      const ratings = await client.fetch(
        `*[_type == "rating" && productId == $productId]`,
        { productId }
      );

      const average = ratings.reduce((sum: number, r: Rating) => sum + r.value, 0) / ratings.length;

      // Update product with new average rating
      await client
        .patch(productId)
        .set({ rating: parseFloat(average.toFixed(1)) })
        .commit();

      setRating(parseFloat(average.toFixed(1)));
      setUserRating(value);

      // Animation for rating confirmation
      gsap.fromTo('.rating-stars', 
        { scale: 0.9 }, 
        { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }
      );

      toast({
        title: 'Rating submitted',
        description: `You rated this product ${value} stars`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to submit feedback',
        variant: 'default',
      });
      return;
    }

    if (!comment.trim() || userRating === 0) {
      toast({
        title: 'Incomplete feedback',
        description: 'Please provide both a rating and comment',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create feedback document
      const newFeedback = await client.create({
        _type: 'feedback',
        productId,
        userId: user?.id,
        userName: user?.fullName || user?.firstName || 'Anonymous',
        userImage: user?.imageUrl,
        comment,
        rating: userRating,
      });

      // Add to local state
      setFeedbacks([newFeedback, ...feedbacks]);
      setComment('');
      setShowForm(false);

      // Animation for new feedback
      gsap.from('.feedback-item:first-child', {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });

      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeedbackExpansion = (id: string) => {
    setExpandedFeedback(prev => prev === id ? null : id);
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div className={`flex ${interactive ? 'rating-stars' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={interactive ? () => handleRateProduct(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            className={`${interactive ? 'cursor-pointer' : ''}`}
            disabled={!interactive || isLoading}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hoverRating || (interactive ? userRating : value))
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="mt-16 border-t border-gray-800 pt-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Customer Feedback</h2>
        
        {/* Rating Summary */}
        <div className="bg-gray-900/50 rounded-lg p-6 mb-8 border border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-5xl font-bold">{rating.toFixed(1)}</p>
              <div className="flex justify-center md:justify-start mt-2">
                {renderStars(rating)}
              </div>
              <p className="text-gray-400 mt-2">
                Based on {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Rate this product</h3>
              <div className="flex items-center gap-2">
                {renderStars(5, true)}
                {userRating > 0 && (
                  <span className="text-sm text-gray-400 ml-2">
                    You rated {userRating} star{userRating !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => setShowForm(!showForm)}
                disabled={userRating === 0}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {showForm ? 'Cancel' : 'Write a review'}
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        {showForm && (
          <div className="bg-gray-900/50 rounded-lg p-6 mb-8 border border-gray-800">
            <h3 className="font-medium mb-4">Your Feedback</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Your rating</p>
                {renderStars(5, true)}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="bg-gray-900 border-gray-800 text-white min-h-[120px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isLoading || !comment.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Submit Feedback
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="space-y-6">
          {feedbacks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No feedback yet. Be the first to review!
            </p>
          ) : (
            feedbacks.map((feedback) => (
              <div 
                key={feedback._id} 
                className="feedback-item bg-gray-900/50 rounded-lg p-6 border border-gray-800"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {feedback.userImage ? (
                      <img
                        src={feedback.userImage}
                        alt={feedback.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
  <span className="text-sm">
    {feedback.userName?.charAt(0)?.toUpperCase() || 'U'}
  </span>
</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{feedback.userName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p 
                        className={`text-gray-300 ${expandedFeedback === feedback._id ? '' : 'line-clamp-3'}`}
                      >
                        {feedback.comment}
                      </p>
                      {feedback.comment.length > 200 && (
                        <button
                          onClick={() => toggleFeedbackExpansion(feedback._id)}
                          className="text-sm text-gray-400 hover:text-white mt-1 flex items-center"
                        >
                          {expandedFeedback === feedback._id ? (
                            <>
                              Show less <ChevronUp className="w-4 h-4 ml-1" />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown className="w-4 h-4 ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}