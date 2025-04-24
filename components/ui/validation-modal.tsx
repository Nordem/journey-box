import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    missingFields?: string[];
}

export function ValidationModal({ isOpen, onClose, title, description, missingFields }: ValidationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 border-destructive">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-yellow-500">Validación Requerida</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive" className="bg-destructive/5">
                        <AlertTitle className="text-destructive">{title}</AlertTitle>
                        <AlertDescription className="text-foreground/80 mt-2">
                            {description}
                        </AlertDescription>
                    </Alert>
                    
                    {missingFields && missingFields.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground/80">Campos requeridos faltantes:</p>
                            <ul className="space-y-1">
                                {missingFields.map((field, index) => (
                                    <li key={index} className="flex items-center text-sm text-foreground/80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-destructive mr-2" />
                                        {field}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 