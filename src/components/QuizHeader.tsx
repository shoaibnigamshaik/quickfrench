import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface QuizHeaderProps {
    onResetQuiz: () => void;
}

export const QuizHeader = ({ onResetQuiz }: QuizHeaderProps) => {
    return (
        <div className="text-center mb-5 relative">
            {/* Mobile layout: back arrow and heading on same level */}
            <div className="md:hidden flex items-center justify-center relative">
                <Link
                    href="/"
                    onClick={onResetQuiz}
                    className="absolute left-0 flex items-center transition-colors duration-200 hover:underline"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1
                    className="text-2xl font-bold"
                    style={{ color: 'var(--foreground)' }}
                >
                    Translate the Word
                </h1>
            </div>

            {/* Desktop layout: original design */}
            <div className="hidden md:block">
                <Link
                    href="/"
                    onClick={onResetQuiz}
                    className="absolute top-2 left-0 flex items-center transition-colors duration-200 hover:underline"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Back</span>
                </Link>

                <div className="pt-6">
                    <h1
                        className="text-[28px] font-bold"
                        style={{ color: 'var(--foreground)' }}
                    >
                        Translate the Word
                    </h1>
                </div>
            </div>
        </div>
    );
};
