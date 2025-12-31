import React from 'react';
import GanttChart from './GanttChart';

const Planification = ({ culturesSelectionnees, jardins }) => {
  return (
    <div className="space-y-6">
      <GanttChart 
        culturesSelectionnees={culturesSelectionnees} 
        jardins={jardins} 
      />
    </div>
  );
};

export default Planification;
