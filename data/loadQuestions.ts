// Utility to load all topic files and merge them into the format expected by the app
import { Question, Category } from '@/types';
import twoPointers from './topics/two-pointers.json';
import slidingWindow from './topics/sliding-window.json';
import binarySearch from './topics/binary-search.json';
import dynamicProgramming from './topics/dynamic-programming.json';
import graphs from './topics/graphs.json';
import trees from './topics/trees.json';
import arrays from './topics/arrays.json';
import strings from './topics/strings.json';
import linkedLists from './topics/linked-lists.json';
import stackQueue from './topics/stack-queue.json';
import backtracking from './topics/backtracking.json';
import bitmanipulation from './topics/bit-manipulation.json';
import heap from './topics/heap.json';
import tries from './topics/tries.json';
const topicFiles = [
  bitmanipulation,
  arrays,
  strings,
  twoPointers,
  slidingWindow,
  binarySearch,
  linkedLists,
  stackQueue,
  graphs,
  trees,
  heap,
  dynamicProgramming,
  backtracking,
  tries
];

// Merge all topics into single structure
export const questionsData: {
  categories: Category[];
  questions: Question[];
} = {
  categories: topicFiles.map(topic => topic.category as Category),
  questions: topicFiles.flatMap(topic => topic.questions as Question[])
};

export default questionsData;
