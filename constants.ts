
import type { Sport } from './types';
import { FootballIcon, BasketballIcon, BaseballIcon, SoccerIcon, HockeyIcon } from './components/Icons';

export const SPORTS: Sport[] = [
    { name: 'NFL', icon: FootballIcon },
    { name: 'NBA', icon: BasketballIcon },
    { name: 'MLB', icon: BaseballIcon },
    { name: 'Soccer', icon: SoccerIcon },
    { name: 'NHL', icon: HockeyIcon },
];