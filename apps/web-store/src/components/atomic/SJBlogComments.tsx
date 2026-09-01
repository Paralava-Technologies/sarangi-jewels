'use client';

import React, { useState, useEffect } from 'react';
import { isLoggedIn, getAccessToken } from '@/lib/auth';

export function SJBlogComments({ postId }: { postId: string }) {
  const [isAuth, setIsAuth] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/blogs/${postId}/comments`);
      const json = await res.json();
      if (json.data) setComments(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsAuth(isLoggedIn());
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store/blogs/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      
      setNewComment('');
      setSuccess('Your comment has been submitted and is awaiting moderation.');
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-neutral-200">
      <h3 className="text-2xl font-display text-brand-primaryDark mb-8">Comments</h3>
      
      <div className="space-y-6 mb-12">
        {comments.length === 0 ? (
          <p className="text-neutral-500 italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-neutral-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-brand-primaryDark">{comment.user?.firstName} {comment.user?.lastName}</span>
                <span className="text-xs text-neutral-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-neutral-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {isAuth ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 border border-neutral-200 rounded-md shadow-sm">
          <h4 className="text-lg font-semibold mb-4">Leave a Comment</h4>
          {error && <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-sm bg-green-50 p-3 rounded">{success}</div>}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full border border-neutral-300 p-3 rounded focus:outline-none focus:border-brand-primary min-h-[100px] mb-4"
            placeholder="Write your thoughts here..."
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-primary text-white px-6 py-2 uppercase tracking-widest text-xs font-semibold hover:bg-brand-primaryDark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-neutral-50 p-6 text-center border border-neutral-200 rounded-md">
          <p className="text-neutral-600 mb-4">You must be logged in to leave a comment.</p>
          <a href="/login" className="inline-block bg-brand-primary text-white px-6 py-2 uppercase tracking-widest text-xs font-semibold hover:bg-brand-primaryDark transition-colors">
            Log In to Comment
          </a>
        </div>
      )}
    </div>
  );
}
