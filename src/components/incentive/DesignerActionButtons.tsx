
import React from 'react';
import { Save, PlusCircle, ArrowLeft } from 'lucide-react';
import ActionButton from '../ui-custom/ActionButton';
import { IncentivePlanWithStatus } from '@/services/incentive/incentivePlanService';
import ExistingSchemeSelector from './ExistingSchemeSelector';

interface DesignerActionButtonsProps {
  onBack?: () => void;
  onSave?: () => void;
  createNewScheme?: () => void;
  isSaving?: boolean;
  showExistingSchemes: boolean;
  setShowExistingSchemes: (show: boolean) => void;
  copyExistingScheme: (scheme: IncentivePlanWithStatus) => void;
  hideSchemeButtons?: boolean;
}

const DesignerActionButtons: React.FC<DesignerActionButtonsProps> = ({
  onBack,
  onSave,
  createNewScheme,
  isSaving = false,
  showExistingSchemes,
  setShowExistingSchemes,
  copyExistingScheme,
  hideSchemeButtons = false
}) => {
  return (
    <>
      <div className="flex justify-between mb-6">
        {onBack && (
          <ActionButton 
            variant="outline"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Options
          </ActionButton>
        )}
        
        {!hideSchemeButtons && createNewScheme && (
          <div className="flex space-x-4">
            <ActionButton 
              variant="outline"
              size="sm"
              onClick={createNewScheme}
            >
              <PlusCircle size={16} className="mr-2" /> New Scheme
            </ActionButton>
            
            <ExistingSchemeSelector 
              open={showExistingSchemes}
              setOpen={setShowExistingSchemes}
              onSchemeCopy={copyExistingScheme}
            />
          </div>
        )}
      </div>
      
      {onSave && (
        <div className="mt-2 flex justify-end space-x-4">
          <ActionButton
            variant="primary" 
            size="lg"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save size={18} className="mr-2" /> 
            {isSaving ? "Saving..." : "Save"}
          </ActionButton>
        </div>
      )}
    </>
  );
};

export default DesignerActionButtons;
