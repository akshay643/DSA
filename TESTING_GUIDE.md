# Testing the New Question Routes

## Quick Test Guide

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Test Direct URL Access

Open your browser and visit these URLs:

#### Graphs Category
- http://localhost:3000/questions/graphs/graphs-1 (Number of Islands)
- http://localhost:3000/questions/graphs/graphs-2 (Clone Graph)
- http://localhost:3000/questions/graphs/graphs-3 (Course Schedule)

#### Other Categories (if available)
- http://localhost:3000/questions/arrays/arrays-1
- http://localhost:3000/questions/strings/strings-1
- http://localhost:3000/questions/trees/trees-1

### 3. Test the Share Button

1. Visit any question page (e.g., `/questions/graphs/graphs-1`)
2. Click the blue "Share Link" button in the top-right corner
3. Verify the button text changes to "Copied!"
4. Paste in a new tab - you should see the same question

### 4. Test the External Link Icon

1. Go to the home page: http://localhost:3000
2. Expand any category (e.g., Graphs)
3. Hover over any question in the list
4. You should see an external link icon (🔗) appear on the right
5. Click it - the question should open in a new tab

### 5. Test Navigation

#### Back Button
1. Visit any question page
2. Click "Back to Questions" button
3. Should return to home page

#### Header
1. The header should be visible on all question pages
2. Theme toggle should work
3. Logo should be clickable (returns to home)

### 6. Test 404 Handling

Try visiting a question that doesn't exist:
- http://localhost:3000/questions/invalid/invalid-1

You should see:
- "Question Not Found" message
- "Back to Questions" button

### 7. Test Different Questions

Try multiple questions to ensure:
- Different difficulty levels display correctly (easy/medium/hard)
- Company tags show up
- Starter code appears for all languages
- LeetCode/GFG links work (when available)
- All sections render properly

### 8. Test on Mobile

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Visit a question page
4. Check responsive design:
   - Header should be mobile-friendly
   - Content should be readable
   - Buttons should be tap-friendly
   - Share button should work

### 9. Test Dark Mode

1. Toggle dark mode using the header button
2. Visit different question pages
3. Verify all elements have proper contrast
4. Check that code blocks are readable

### 10. Test Progress Tracking

1. Visit a question page
2. Click the checkmark to mark complete
3. Navigate back to home
4. Verify the question shows as completed
5. Visit the question page again
6. The checkmark should still be filled

## Expected Behavior Checklist

✅ Direct URL access works for all questions  
✅ Share button copies URL to clipboard  
✅ External link icon opens questions in new tabs  
✅ Back button returns to home page  
✅ Question not found page works for invalid URLs  
✅ All question details display correctly  
✅ Starter code shows for all languages  
✅ External links to LeetCode/GFG work  
✅ Dark mode works on question pages  
✅ Progress tracking persists across routes  
✅ Responsive design works on mobile  
✅ Header appears on all pages  

## Common Issues & Solutions

### Issue: "Question Not Found"
**Solution**: Make sure the category and question ID match exactly what's in your JSON files.

Example:
- ✅ Correct: `/questions/graphs/graphs-1`
- ❌ Wrong: `/questions/graph/graphs-1` (category name is wrong)
- ❌ Wrong: `/questions/graphs/graph-1` (question ID format is wrong)

### Issue: Share button doesn't work
**Solution**: Ensure you're using HTTPS or localhost (clipboard API requires secure context)

### Issue: Styles look broken
**Solution**: Make sure Tailwind CSS is properly configured and your dev server is running

### Issue: TypeScript errors
**Solution**: Run `npm run build` to check for type errors

## What to Look For

### On Question Pages
- Clean, readable layout
- All sections properly formatted
- Buttons are interactive
- Colors match your theme
- Examples are clearly displayed
- Hints are easy to read
- Complexity analysis is visible

### On Home Page
- External link icons appear on hover
- Clicking questions still opens the in-app editor
- External link opens in new tab
- No layout shifts when hovering

## Advanced Testing

### Test with Query Parameters (Future Enhancement)
While not implemented yet, you could extend the route to support:
```
/questions/graphs/graphs-1?lang=python
/questions/graphs/graphs-1?view=hints
```

### Test Performance
1. Open DevTools > Network tab
2. Visit a question page
3. Check page load time
4. Verify no unnecessary API calls (data should be static)

### Test SEO (if deploying)
1. View page source
2. Check that title and meta tags are present
3. Use Google's Rich Results Test
4. Verify Open Graph tags (if you add them)

---

Happy Testing! 🎉

If everything works, you now have fully shareable question links!
